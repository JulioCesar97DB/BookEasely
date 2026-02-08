'use server'

import { createClient } from '@/lib/supabase/server'
import { workerSchema } from '@/lib/validations/business'
import { revalidatePath } from 'next/cache'

export async function addWorker(businessId: string, data: Record<string, unknown>) {
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
