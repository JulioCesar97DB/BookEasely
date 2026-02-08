'use server'

import { createClient } from '@/lib/supabase/server'
import { serviceSchema } from '@/lib/validations/business'

export async function createService(
	businessId: string,
	data: Record<string, unknown>,
	workerIds: string[]
) {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

	const parsed = serviceSchema.safeParse(data)
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'Invalid data' }
	}

	const { data: service, error } = await supabase
		.from('services')
		.insert({
			business_id: businessId,
			name: parsed.data.name,
			description: parsed.data.description || null,
			price: parsed.data.price,
			duration_minutes: parsed.data.duration_minutes,
			is_active: parsed.data.is_active,
		})
		.select('id')
		.single()

	if (error) return { error: error.message }

	if (workerIds.length > 0 && service) {
		const rows = workerIds.map((wid) => ({
			service_id: service.id,
			worker_id: wid,
		}))
		await supabase.from('service_workers').insert(rows)
	}

	return { success: true }
}

export async function updateService(
	serviceId: string,
	data: Record<string, unknown>,
	workerIds: string[]
) {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

	const parsed = serviceSchema.safeParse(data)
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'Invalid data' }
	}

	const { error } = await supabase
		.from('services')
		.update({
			name: parsed.data.name,
			description: parsed.data.description || null,
			price: parsed.data.price,
			duration_minutes: parsed.data.duration_minutes,
			is_active: parsed.data.is_active,
		})
		.eq('id', serviceId)

	if (error) return { error: error.message }

	// Sync service_workers: delete all then re-insert
	await supabase.from('service_workers').delete().eq('service_id', serviceId)
	if (workerIds.length > 0) {
		const rows = workerIds.map((wid) => ({
			service_id: serviceId,
			worker_id: wid,
		}))
		await supabase.from('service_workers').insert(rows)
	}

	return { success: true }
}

export async function deleteService(serviceId: string) {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

	const { error } = await supabase
		.from('services')
		.delete()
		.eq('id', serviceId)

	if (error) return { error: error.message }
	return { success: true }
}
