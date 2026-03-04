'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const uuid = z.string().uuid()
const validStatuses = ['confirmed', 'completed', 'cancelled'] as const
const statusSchema = z.enum(validStatuses)

export async function updateBookingStatus(bookingId: string, status: string) {
	if (!uuid.safeParse(bookingId).success) return { error: 'Invalid booking ID' }
	if (!statusSchema.safeParse(status).success) return { error: 'Invalid status' }

	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

	// Verify user is the business owner of this booking
	const { data: booking } = await supabase
		.from('bookings')
		.select('business_id')
		.eq('id', bookingId)
		.single()

	if (!booking) return { error: 'Booking not found' }

	const { data: business } = await supabase
		.from('businesses')
		.select('id')
		.eq('id', booking.business_id)
		.eq('owner_id', user.id)
		.single()

	if (!business) return { error: 'Not authorized to update this booking' }

	const { error } = await supabase
		.from('bookings')
		.update({ status, updated_at: new Date().toISOString() })
		.eq('id', bookingId)

	if (error) return { error: error.message }

	revalidatePath('/dashboard/bookings')
	revalidatePath('/dashboard/calendar')
	return { success: true }
}

export async function getBookingsForRange(businessId: string, startDate: string, endDate: string) {
	if (!uuid.safeParse(businessId).success) return { error: 'Invalid business ID', data: null }

	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated', data: null }

	const { data, error } = await supabase
		.from('bookings')
		.select('id, date, start_time, end_time, status, note, cancellation_reason, business_id, service_id, worker_id, services(name, duration_minutes, price), workers(id, display_name), profiles!bookings_client_id_fkey(full_name, phone)')
		.eq('business_id', businessId)
		.gte('date', startDate)
		.lte('date', endDate)
		.in('status', ['pending', 'confirmed', 'completed', 'cancelled'])
		.order('date')
		.order('start_time')

	if (error) return { error: error.message, data: null }
	return { error: null, data }
}
