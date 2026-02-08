'use server'

import { createClient } from '@/lib/supabase/server';
import { businessSettingsSchema } from '@/lib/validations/business';
import { revalidatePath } from 'next/cache';

export async function updateProfile(data: { full_name: string; phone: string }) {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

	const full_name = data.full_name.trim()
	if (!full_name) return { error: 'Name is required' }

	const { error } = await supabase
		.from('profiles')
		.update({
			full_name,
			phone: data.phone.trim(),
		})
		.eq('id', user.id)

	if (error) return { error: error.message }

	revalidatePath('/dashboard')
	revalidatePath('/dashboard/settings')
	revalidatePath('/dashboard/profile')
	return { success: true }
}

export async function updateBusinessSettings(
	businessId: string,
	data: Record<string, unknown>
) {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

	const parsed = businessSettingsSchema.safeParse(data)
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'Invalid data' }
	}

	const { error } = await supabase
		.from('businesses')
		.update({
			cancellation_policy: parsed.data.cancellation_policy || null,
			cancellation_hours: parsed.data.cancellation_hours,
			auto_confirm: parsed.data.auto_confirm,
			buffer_minutes: parsed.data.buffer_minutes,
		})
		.eq('id', businessId)
		.eq('owner_id', user.id)

	if (error) return { error: error.message }

	revalidatePath('/dashboard/settings')
	return { success: true }
}
