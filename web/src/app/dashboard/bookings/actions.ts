'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateBookingStatus(bookingId: string, status: string) {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

	const validStatuses = ['confirmed', 'completed', 'cancelled']
	if (!validStatuses.includes(status)) {
		return { error: 'Invalid status' }
	}

	const { error } = await supabase
		.from('bookings')
		.update({ status, updated_at: new Date().toISOString() })
		.eq('id', bookingId)

	if (error) return { error: error.message }

	revalidatePath('/dashboard/bookings')
	return { success: true }
}
