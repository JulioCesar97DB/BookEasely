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

export async function updateNotificationPreferences(data: {
	sms_enabled: boolean
	push_enabled: boolean
	reminder_enabled: boolean
}) {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

	const { error } = await supabase
		.from('notification_preferences')
		.upsert({
			user_id: user.id,
			sms_enabled: data.sms_enabled,
			push_enabled: data.push_enabled,
			reminder_enabled: data.reminder_enabled,
			updated_at: new Date().toISOString(),
		}, { onConflict: 'user_id' })

	if (error) return { error: error.message }

	revalidatePath('/dashboard/settings')
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
