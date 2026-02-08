'use server'

import { createClient } from '@/lib/supabase/server'
import { businessHoursSchema, businessProfileSchema } from '@/lib/validations/business'
import { revalidatePath } from 'next/cache'

export async function updateBusinessProfile(businessId: string, data: Record<string, unknown>) {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

	const parsed = businessProfileSchema.safeParse(data)
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'Invalid data' }
	}

	const { error } = await supabase
		.from('businesses')
		.update({
			name: parsed.data.name,
			description: parsed.data.description || null,
			category_id: parsed.data.category_id || null,
			address: parsed.data.address,
			city: parsed.data.city,
			state: parsed.data.state,
			zip_code: parsed.data.zip_code,
			phone: parsed.data.phone,
			email: parsed.data.email || null,
			website: parsed.data.website || null,
		})
		.eq('id', businessId)
		.eq('owner_id', user.id)

	if (error) return { error: error.message }

	revalidatePath('/dashboard/business')
	return { success: true }
}

export async function updateBusinessHours(
	businessId: string,
	hours: Array<{ day_of_week: number; open_time: string; close_time: string; is_closed: boolean }>
) {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

	const parsed = businessHoursSchema.safeParse(hours)
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'Invalid hours data' }
	}

	const rows = parsed.data.map((h) => ({
		business_id: businessId,
		day_of_week: h.day_of_week,
		open_time: h.open_time,
		close_time: h.close_time,
		is_closed: h.is_closed,
	}))

	const { error } = await supabase
		.from('business_hours')
		.upsert(rows, { onConflict: 'business_id,day_of_week' })

	if (error) return { error: error.message }

	revalidatePath('/dashboard/business')
	return { success: true }
}

export async function updateBusinessSettings(
	businessId: string,
	data: { cancellation_policy?: string; cancellation_hours?: number; auto_confirm?: boolean; buffer_minutes?: number }
) {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

	const { error } = await supabase
		.from('businesses')
		.update({
			cancellation_policy: data.cancellation_policy ?? null,
			cancellation_hours: data.cancellation_hours ?? 24,
			auto_confirm: data.auto_confirm ?? true,
			buffer_minutes: data.buffer_minutes ?? 0,
		})
		.eq('id', businessId)
		.eq('owner_id', user.id)

	if (error) return { error: error.message }

	revalidatePath('/dashboard/business')
	return { success: true }
}
