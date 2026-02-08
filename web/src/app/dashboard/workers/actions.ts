'use server'

import { createClient } from '@/lib/supabase/server'
import { workerSchema } from '@/lib/validations/business'
import { revalidatePath } from 'next/cache'

export async function addSelfAsWorker(businessId: string, data: Record<string, unknown>) {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

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
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

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
		// Check if already a worker for this business
		const { data: existingWorker } = await supabase
			.from('workers')
			.select('id')
			.eq('user_id', existingProfile.id)
			.eq('business_id', businessId)
			.single()

		if (existingWorker) {
			return { error: 'This person is already a worker for your business' }
		}

		// User exists — create worker directly
		const { error: workerError } = await supabase.from('workers').insert({
			business_id: businessId,
			user_id: existingProfile.id,
			display_name: data.display_name.trim(),
			bio: data.bio.trim() || null,
			specialties: data.specialties.length > 0 ? data.specialties : null,
			is_active: true,
		})

		if (workerError) return { error: workerError.message }

		// Create accepted invitation record for history
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
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

	const { error } = await supabase
		.from('worker_invitations')
		.delete()
		.eq('id', invitationId)

	if (error) return { error: error.message }

	revalidatePath('/dashboard/workers')
	return { success: true }
}

export async function updateWorker(workerId: string, data: Record<string, unknown>) {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

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

export async function toggleWorkerActive(workerId: string, isActive: boolean) {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

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
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

	const rows = availability.map((a) => ({
		worker_id: workerId,
		day_of_week: a.day_of_week,
		start_time: a.start_time,
		end_time: a.end_time,
		is_active: a.is_active,
	}))

	// Delete existing and re-insert for clean sync
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
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

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
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

	const { error } = await supabase
		.from('worker_blocked_dates')
		.delete()
		.eq('id', blockedDateId)

	if (error) return { error: error.message }

	revalidatePath('/dashboard/workers')
	revalidatePath('/dashboard/schedule')
	return { success: true }
}
