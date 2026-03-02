'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateTimeSlots, type TimeSlot } from './time-slots'

// ── Get available time slots for a service + worker + date ──────────

export async function getAvailableSlots({
	businessId,
	serviceId,
	workerId,
	date,
}: {
	businessId: string
	serviceId: string
	workerId: string
	date: string // YYYY-MM-DD
}): Promise<{ slots: TimeSlot[]; error?: string }> {
	const supabase = await createClient()

	// Get service duration
	const { data: service } = await supabase
		.from('services')
		.select('duration_minutes')
		.eq('id', serviceId)
		.single()

	if (!service) return { slots: [], error: 'Service not found' }

	// Get business buffer
	const { data: business } = await supabase
		.from('businesses')
		.select('buffer_minutes')
		.eq('id', businessId)
		.single()

	const bufferMinutes = business?.buffer_minutes ?? 0

	// Get day of week for the requested date
	const dayOfWeek = new Date(date + 'T12:00:00').getDay()

	// Get worker availability for that day
	const { data: availability } = await supabase
		.from('worker_availability')
		.select('start_time, end_time')
		.eq('worker_id', workerId)
		.eq('day_of_week', dayOfWeek)
		.eq('is_active', true)

	if (!availability || availability.length === 0) {
		return { slots: [], error: 'Worker not available on this day' }
	}

	// Get existing bookings for this worker on this date (non-cancelled)
	const { data: existingBookings } = await supabase
		.from('bookings')
		.select('start_time, end_time')
		.eq('worker_id', workerId)
		.eq('date', date)
		.in('status', ['pending', 'confirmed'])

	// Get blocked dates for this worker
	const { data: blockedDates } = await supabase
		.from('worker_blocked_dates')
		.select('date, start_time, end_time')
		.eq('worker_id', workerId)
		.eq('date', date)

	const slots = generateTimeSlots({
		availability: availability ?? [],
		existingBookings: existingBookings ?? [],
		blockedDates: blockedDates ?? [],
		date,
		durationMinutes: service.duration_minutes,
		bufferMinutes,
	})

	return { slots }
}

// ── Get available workers for a service + date (with slot counts) ───

export async function getAvailableWorkers({
	businessId,
	serviceId,
	date,
}: {
	businessId: string
	serviceId: string
	date: string
}): Promise<{
	workers: { id: string; display_name: string; avatar_url: string | null; slotCount: number }[]
}> {
	const supabase = await createClient()

	// Get workers assigned to this service
	const { data: serviceWorkers } = await supabase
		.from('service_workers')
		.select('worker_id, workers(id, display_name, avatar_url, is_active)')
		.eq('service_id', serviceId)

	if (!serviceWorkers) return { workers: [] }

	const activeWorkers = serviceWorkers
		.map((sw) => sw.workers)
		.filter((w): w is { id: string; display_name: string; avatar_url: string | null; is_active: boolean } =>
			w !== null && w.is_active
		)

	// For each worker, count available slots
	const result = await Promise.all(
		activeWorkers.map(async (worker) => {
			const { slots } = await getAvailableSlots({
				businessId,
				serviceId,
				workerId: worker.id,
				date,
			})
			return {
				id: worker.id,
				display_name: worker.display_name,
				avatar_url: worker.avatar_url,
				slotCount: slots.length,
			}
		})
	)

	// Only return workers with available slots
	return { workers: result.filter((w) => w.slotCount > 0) }
}

// ── Create a booking ────────────────────────────────────────────────

export async function createBooking({
	businessId,
	serviceId,
	workerId,
	date,
	startTime,
	endTime,
	note,
}: {
	businessId: string
	serviceId: string
	workerId: string
	date: string
	startTime: string
	endTime: string
	note?: string
}): Promise<{ bookingId?: string; error?: string }> {
	const supabase = await createClient()

	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

	// Verify the slot is still available (race condition prevention)
	const { slots } = await getAvailableSlots({
		businessId,
		serviceId,
		workerId,
		date,
	})

	const slotAvailable = slots.some(
		(s) => s.start === startTime && s.end === endTime
	)

	if (!slotAvailable) {
		return { error: 'This time slot is no longer available. Please select another time.' }
	}

	// Check if business has auto_confirm
	const { data: business } = await supabase
		.from('businesses')
		.select('auto_confirm')
		.eq('id', businessId)
		.single()

	const status = business?.auto_confirm ? 'confirmed' : 'pending'

	// Create the booking
	const { data: booking, error } = await supabase
		.from('bookings')
		.insert({
			client_id: user.id,
			business_id: businessId,
			worker_id: workerId,
			service_id: serviceId,
			date,
			start_time: startTime,
			end_time: endTime,
			status,
			note: note || null,
		})
		.select('id')
		.single()

	if (error) {
		if (error.code === '23505') {
			return { error: 'This time slot has just been booked by someone else.' }
		}
		return { error: error.message }
	}

	revalidatePath('/dashboard/bookings')
	return { bookingId: booking.id }
}

// ── Cancel a booking ────────────────────────────────────────────────

export async function cancelBooking({
	bookingId,
	reason,
}: {
	bookingId: string
	reason?: string
}): Promise<{ error?: string }> {
	const supabase = await createClient()

	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

	const { error } = await supabase
		.from('bookings')
		.update({
			status: 'cancelled',
			cancelled_by: user.id,
			cancellation_reason: reason || null,
			updated_at: new Date().toISOString(),
		})
		.eq('id', bookingId)

	if (error) return { error: error.message }

	revalidatePath('/dashboard/bookings')
	return {}
}

// ── Toggle favorite ─────────────────────────────────────────────────

export async function toggleFavorite(businessId: string): Promise<{ isFavorited: boolean; error?: string }> {
	const supabase = await createClient()

	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { isFavorited: false, error: 'Not authenticated' }

	// Check if already favorited
	const { data: existing } = await supabase
		.from('favorites')
		.select('id')
		.eq('client_id', user.id)
		.eq('business_id', businessId)
		.maybeSingle()

	if (existing) {
		await supabase.from('favorites').delete().eq('id', existing.id)
		revalidatePath('/dashboard/favorites')
		return { isFavorited: false }
	}

	await supabase.from('favorites').insert({
		client_id: user.id,
		business_id: businessId,
	})

	revalidatePath('/dashboard/favorites')
	return { isFavorited: true }
}

// ── Submit a review ─────────────────────────────────────────────────

export async function submitReview({
	bookingId,
	businessId,
	rating,
	comment,
}: {
	bookingId: string
	businessId: string
	rating: number
	comment?: string
}): Promise<{ error?: string }> {
	const supabase = await createClient()

	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

	if (rating < 1 || rating > 5) return { error: 'Rating must be between 1 and 5' }

	const { error } = await supabase.from('reviews').insert({
		booking_id: bookingId,
		client_id: user.id,
		business_id: businessId,
		rating,
		comment: comment || null,
	})

	if (error) {
		if (error.code === '23505') {
			return { error: 'You have already reviewed this booking' }
		}
		return { error: error.message }
	}

	revalidatePath('/dashboard/bookings')
	revalidatePath(`/business`)
	return {}
}

// ── Respond to a review (business owner) ────────────────────────────

export async function respondToReview({
	reviewId,
	response,
}: {
	reviewId: string
	response: string
}): Promise<{ error?: string }> {
	const supabase = await createClient()

	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

	const { error } = await supabase
		.from('reviews')
		.update({ business_response: response })
		.eq('id', reviewId)

	if (error) return { error: error.message }

	revalidatePath('/dashboard/reviews')
	return {}
}

// ── Mark notification as read ───────────────────────────────────────

export async function markNotificationRead(notificationId: string): Promise<{ error?: string }> {
	const supabase = await createClient()

	const { error } = await supabase
		.from('notifications')
		.update({ is_read: true })
		.eq('id', notificationId)

	if (error) return { error: error.message }
	return {}
}

export async function markAllNotificationsRead(): Promise<{ error?: string }> {
	const supabase = await createClient()

	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

	const { error } = await supabase
		.from('notifications')
		.update({ is_read: true })
		.eq('user_id', user.id)
		.eq('is_read', false)

	if (error) return { error: error.message }
	return {}
}
