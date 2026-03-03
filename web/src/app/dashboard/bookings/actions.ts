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
	return { success: true }
}
