'use server'

import { createClient } from '@/lib/supabase/server'
import { workerSchema } from '@/lib/validations/business'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const uuid = z.string().uuid()

// ── Helpers ──────────────────────────────────────────────────────────

async function getAuthUser() {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	return { supabase, user }
}

/** Verify the authenticated user owns the business that this worker belongs to */
async function verifyWorkerOwnership(supabase: Awaited<ReturnType<typeof createClient>>, workerId: string, userId: string) {
	const { data: worker } = await supabase
		.from('workers')
		.select('business_id')
		.eq('id', workerId)
		.single()

	if (!worker) return false

	const { data: business } = await supabase
		.from('businesses')
		.select('id')
		.eq('id', worker.business_id)
		.eq('owner_id', userId)
		.single()

	return !!business
}

/** Verify the authenticated user owns the given business */
async function verifyBusinessOwnership(supabase: Awaited<ReturnType<typeof createClient>>, businessId: string, userId: string) {
	const { data } = await supabase
		.from('businesses')
		.select('id')
		.eq('id', businessId)
		.eq('owner_id', userId)
		.single()
	return !!data
}

// ── Actions ──────────────────────────────────────────────────────────

export async function addSelfAsWorker(businessId: string, data: Record<string, unknown>) {
	if (!uuid.safeParse(businessId).success) return { error: 'Invalid business ID' }

	const { supabase, user } = await getAuthUser()
	if (!user) return { error: 'Not authenticated' }

	const isOwner = await verifyBusinessOwnership(supabase, businessId, user.id)
	if (!isOwner) return { error: 'Not authorized' }

	const parsed = workerSchema.safeParse(data)
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'Invalid data' }
	}

	const { error } = await supabase.from('workers').insert({
		business_id: businessId,
		user_id: user.id,
		display_name: parsed.data.display_name,
		bio: parsed.data.bio || null,
		specialties: parsed.data.specialties.length > 0 ? parsed.data.specialties : null,
		is_active: parsed.data.is_active,
	})

	if (error) return { error: error.message }

	revalidatePath('/dashboard/workers')
	return { success: true }
}

export async function inviteWorker(
	businessId: string,
	data: { email: string; display_name: string; bio: string; specialties: string[] }
) {
	if (!uuid.safeParse(businessId).success) return { error: 'Invalid business ID' }

	const { supabase, user } = await getAuthUser()
	if (!user) return { error: 'Not authenticated' }

	const isOwner = await verifyBusinessOwnership(supabase, businessId, user.id)
	if (!isOwner) return { error: 'Not authorized' }

	const email = data.email.trim().toLowerCase()
	if (!email) return { error: 'Email is required' }

	// Check if already invited
	const { data: existingInvite } = await supabase
		.from('worker_invitations')
		.select('id, status')
		.eq('email', email)
		.eq('business_id', businessId)
		.single()

	if (existingInvite) {
		if (existingInvite.status === 'pending') {
			return { error: 'This email already has a pending invitation' }
		}
		if (existingInvite.status === 'accepted') {
			return { error: 'This person is already a worker' }
		}
	}

	// Check if user already exists in the platform
	const { data: existingProfile } = await supabase
		.from('profiles')
		.select('id')
		.eq('email', email)
		.single()

	if (existingProfile) {
		const { data: existingWorker } = await supabase
			.from('workers')
			.select('id')
			.eq('user_id', existingProfile.id)
			.eq('business_id', businessId)
			.single()

		if (existingWorker) {
			return { error: 'This person is already a worker for your business' }
		}

		const { error: workerError } = await supabase.from('workers').insert({
			business_id: businessId,
			user_id: existingProfile.id,
			display_name: data.display_name.trim(),
			bio: data.bio.trim() || null,
			specialties: data.specialties.length > 0 ? data.specialties : null,
			is_active: true,
		})

		if (workerError) return { error: workerError.message }

		await supabase.from('worker_invitations').insert({
			business_id: businessId,
			email,
			display_name: data.display_name.trim(),
			bio: data.bio.trim() || null,
			specialties: data.specialties.length > 0 ? data.specialties : null,
			invited_by: user.id,
			status: 'accepted',
			accepted_at: new Date().toISOString(),
		})

		// Notify the worker they've been added
		const { data: biz } = await supabase.from('businesses').select('name').eq('id', businessId).single()
		await supabase.from('notifications').insert({
			user_id: existingProfile.id,
			type: 'worker_added',
			title: 'Added to team',
			message: `You were added as a worker at ${biz?.name ?? 'a business'}`,
			data: { business_id: businessId },
		})

		revalidatePath('/dashboard/workers')
		return { success: true, message: 'Worker added successfully!' }
	}

	// User doesn't exist — create pending invitation
	const { error: inviteError } = await supabase.from('worker_invitations').insert({
		business_id: businessId,
		email,
		display_name: data.display_name.trim(),
		bio: data.bio.trim() || null,
		specialties: data.specialties.length > 0 ? data.specialties : null,
		invited_by: user.id,
		status: 'pending',
	})

	if (inviteError) return { error: inviteError.message }

	revalidatePath('/dashboard/workers')
	return { success: true, message: 'Invitation created! They\'ll be added automatically when they sign up.' }
}

export async function cancelInvitation(invitationId: string) {
	if (!uuid.safeParse(invitationId).success) return { error: 'Invalid invitation ID' }

	const { supabase, user } = await getAuthUser()
	if (!user) return { error: 'Not authenticated' }

	// Verify user owns the business this invitation belongs to
	const { data: invitation } = await supabase
		.from('worker_invitations')
		.select('business_id')
		.eq('id', invitationId)
		.single()

	if (!invitation) return { error: 'Invitation not found' }

	const isOwner = await verifyBusinessOwnership(supabase, invitation.business_id, user.id)
	if (!isOwner) return { error: 'Not authorized' }

	const { error } = await supabase
		.from('worker_invitations')
		.delete()
		.eq('id', invitationId)

	if (error) return { error: error.message }

	revalidatePath('/dashboard/workers')
	return { success: true }
}

export async function updateWorker(workerId: string, data: Record<string, unknown>) {
	if (!uuid.safeParse(workerId).success) return { error: 'Invalid worker ID' }

	const { supabase, user } = await getAuthUser()
	if (!user) return { error: 'Not authenticated' }

	const isOwner = await verifyWorkerOwnership(supabase, workerId, user.id)
	if (!isOwner) return { error: 'Not authorized' }

	const parsed = workerSchema.safeParse(data)
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'Invalid data' }
	}

	const { error } = await supabase
		.from('workers')
		.update({
			display_name: parsed.data.display_name,
			bio: parsed.data.bio || null,
			specialties: parsed.data.specialties.length > 0 ? parsed.data.specialties : null,
			is_active: parsed.data.is_active,
		})
		.eq('id', workerId)

	if (error) return { error: error.message }

	revalidatePath('/dashboard/workers')
	return { success: true }
}

export async function respondToInvitation(invitationId: string, accept: boolean) {
	if (!uuid.safeParse(invitationId).success) return { error: 'Invalid invitation ID' }

	const { supabase, user } = await getAuthUser()
	if (!user) return { error: 'Not authenticated' }

	// Get user email
	const { data: profile } = await supabase.from('profiles').select('email').eq('id', user.id).single()
	if (!profile) return { error: 'Profile not found' }

	// Verify invitation belongs to this user's email
	const { data: invitation } = await supabase
		.from('worker_invitations')
		.select('id, business_id, display_name, bio, specialties, invited_by, status')
		.eq('id', invitationId)
		.eq('email', profile.email)
		.single()

	if (!invitation) return { error: 'Invitation not found' }
	if (invitation.status !== 'pending') return { error: 'Invitation is no longer pending' }

	if (accept) {
		// Create worker record
		const { error: workerError } = await supabase.from('workers').insert({
			business_id: invitation.business_id,
			user_id: user.id,
			display_name: invitation.display_name,
			bio: invitation.bio || null,
			specialties: invitation.specialties,
			is_active: true,
		})
		if (workerError) return { error: workerError.message }

		// Update invitation
		await supabase.from('worker_invitations').update({
			status: 'accepted',
			accepted_at: new Date().toISOString(),
		}).eq('id', invitationId)

		// Notify the business owner
		const { data: biz } = await supabase.from('businesses').select('name').eq('id', invitation.business_id).single()
		await supabase.from('notifications').insert({
			user_id: invitation.invited_by,
			type: 'worker_invitation',
			title: 'Invitation accepted',
			message: `${invitation.display_name} accepted the invitation to join ${biz?.name ?? 'your business'}`,
			data: { business_id: invitation.business_id },
		})
	} else {
		// Decline
		await supabase.from('worker_invitations').update({
			status: 'declined',
		}).eq('id', invitationId)

		// Notify the business owner
		const { data: biz } = await supabase.from('businesses').select('name').eq('id', invitation.business_id).single()
		await supabase.from('notifications').insert({
			user_id: invitation.invited_by,
			type: 'worker_invitation',
			title: 'Invitation declined',
			message: `${invitation.display_name} declined the invitation to join ${biz?.name ?? 'your business'}`,
			data: { business_id: invitation.business_id },
		})
	}

	revalidatePath('/dashboard')
	revalidatePath('/dashboard/workers')
	return { success: true }
}

export async function toggleWorkerActive(workerId: string, isActive: boolean) {
	if (!uuid.safeParse(workerId).success) return { error: 'Invalid worker ID' }

	const { supabase, user } = await getAuthUser()
	if (!user) return { error: 'Not authenticated' }

	const isOwner = await verifyWorkerOwnership(supabase, workerId, user.id)
	if (!isOwner) return { error: 'Not authorized' }

	const { error } = await supabase
		.from('workers')
		.update({ is_active: isActive })
		.eq('id', workerId)

	if (error) return { error: error.message }

	revalidatePath('/dashboard/workers')
	return { success: true }
}

export async function upsertWorkerAvailability(
	workerId: string,
	availability: Array<{ day_of_week: number; start_time: string; end_time: string; is_active: boolean }>
) {
	if (!uuid.safeParse(workerId).success) return { error: 'Invalid worker ID' }

	const { supabase, user } = await getAuthUser()
	if (!user) return { error: 'Not authenticated' }

	const isOwner = await verifyWorkerOwnership(supabase, workerId, user.id)
	if (!isOwner) return { error: 'Not authorized' }

	// Validate time ranges
	for (const a of availability) {
		if (a.is_active && a.start_time >= a.end_time) {
			return { error: `End time must be after start time for day ${a.day_of_week}` }
		}
	}

	const rows = availability.map((a) => ({
		worker_id: workerId,
		day_of_week: a.day_of_week,
		start_time: a.start_time,
		end_time: a.end_time,
		is_active: a.is_active,
	}))

	await supabase.from('worker_availability').delete().eq('worker_id', workerId)
	const { error } = await supabase.from('worker_availability').insert(rows)

	if (error) return { error: error.message }

	revalidatePath('/dashboard/workers')
	revalidatePath('/dashboard/schedule')
	return { success: true }
}

export async function addBlockedDate(
	workerId: string,
	data: { date: string; start_time?: string; end_time?: string; reason?: string }
) {
	if (!uuid.safeParse(workerId).success) return { error: 'Invalid worker ID' }

	const { supabase, user } = await getAuthUser()
	if (!user) return { error: 'Not authenticated' }

	const isOwner = await verifyWorkerOwnership(supabase, workerId, user.id)
	if (!isOwner) return { error: 'Not authorized' }

	const { error } = await supabase.from('worker_blocked_dates').insert({
		worker_id: workerId,
		date: data.date,
		start_time: data.start_time || null,
		end_time: data.end_time || null,
		reason: data.reason || null,
	})

	if (error) return { error: error.message }

	revalidatePath('/dashboard/workers')
	revalidatePath('/dashboard/schedule')
	return { success: true }
}

export async function removeBlockedDate(blockedDateId: string) {
	if (!uuid.safeParse(blockedDateId).success) return { error: 'Invalid blocked date ID' }

	const { supabase, user } = await getAuthUser()
	if (!user) return { error: 'Not authenticated' }

	// Verify ownership through the blocked date -> worker -> business chain
	const { data: blockedDate } = await supabase
		.from('worker_blocked_dates')
		.select('worker_id')
		.eq('id', blockedDateId)
		.single()

	if (!blockedDate) return { error: 'Blocked date not found' }

	const isOwner = await verifyWorkerOwnership(supabase, blockedDate.worker_id, user.id)
	if (!isOwner) return { error: 'Not authorized' }

	const { error } = await supabase
		.from('worker_blocked_dates')
		.delete()
		.eq('id', blockedDateId)

	if (error) return { error: error.message }

	revalidatePath('/dashboard/workers')
	revalidatePath('/dashboard/schedule')
	return { success: true }
}
