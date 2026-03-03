'use server'

import { createClient } from '@/lib/supabase/server'
import {
	bookingIdSchema,
	businessIdSchema,
	cancelBookingSchema,
	createBookingSchema,
	getAvailableSlotsSchema,
	getAvailableWorkersSchema,
	notificationIdSchema,
	rescheduleBookingSchema,
	respondToReviewSchema,
	submitReviewSchema,
} from '@/lib/validations/booking'
import { type ServiceWorkerWithDetails, type Worker, typedQuery } from '@/lib/types'
import { revalidatePath } from 'next/cache'
import { generateTimeSlots, type TimeSlot } from './time-slots'

// ── Helpers ──────────────────────────────────────────────────────────

async function getAuthUser() {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	return { supabase, user }
}

async function verifyBusinessOwner(supabase: Awaited<ReturnType<typeof createClient>>, businessId: string, userId: string) {
	const { data } = await supabase
		.from('businesses')
		.select('id')
		.eq('id', businessId)
		.eq('owner_id', userId)
		.single()
	return !!data
}

// ── Get available time slots for a service + worker + date ──────────

export async function getAvailableSlots(input: {
	businessId: string
	serviceId: string
	workerId: string
	date: string
}): Promise<{ slots: TimeSlot[]; error?: string }> {
	const parsed = getAvailableSlotsSchema.safeParse(input)
	if (!parsed.success) return { slots: [], error: parsed.error.issues[0]?.message ?? 'Invalid input' }

	const { businessId, serviceId, workerId, date } = parsed.data
	const supabase = await createClient()

	const { data: service } = await supabase
		.from('services')
		.select('duration_minutes')
		.eq('id', serviceId)
		.single()

	if (!service) return { slots: [], error: 'Service not found' }

	const { data: business } = await supabase
		.from('businesses')
		.select('buffer_minutes')
		.eq('id', businessId)
		.single()

	const bufferMinutes = business?.buffer_minutes ?? 0
	const dayOfWeek = new Date(date + 'T12:00:00').getDay()

	const { data: availability } = await supabase
		.from('worker_availability')
		.select('start_time, end_time')
		.eq('worker_id', workerId)
		.eq('day_of_week', dayOfWeek)
		.eq('is_active', true)

	if (!availability || availability.length === 0) {
		return { slots: [], error: 'Worker not available on this day' }
	}

	const { data: existingBookings } = await supabase
		.from('bookings')
		.select('start_time, end_time')
		.eq('worker_id', workerId)
		.eq('date', date)
		.in('status', ['pending', 'confirmed'])

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

export async function getAvailableWorkers(input: {
	businessId: string
	serviceId: string
	date: string
}): Promise<{
	workers: { id: string; display_name: string; avatar_url: string | null; slotCount: number }[]
}> {
	const parsed = getAvailableWorkersSchema.safeParse(input)
	if (!parsed.success) return { workers: [] }

	const { businessId, serviceId, date } = parsed.data
	const supabase = await createClient()

	const { data: serviceWorkers } = await supabase
		.from('service_workers')
		.select('worker_id, workers(id, display_name, avatar_url, is_active)')
		.eq('service_id', serviceId)

	if (!serviceWorkers) return { workers: [] }

	type WorkerInfo = Pick<Worker, 'id' | 'display_name' | 'avatar_url' | 'is_active'>
	const activeWorkers: WorkerInfo[] = typedQuery<ServiceWorkerWithDetails[]>(serviceWorkers)
		.map((sw) => sw.workers)
		.filter((w): w is WorkerInfo => w !== null && w.is_active)

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

	return { workers: result.filter((w) => w.slotCount > 0) }
}

// ── Get available slots across ALL workers for a service + date ─────

export async function getAvailableSlotsAnyWorker(input: {
	businessId: string
	serviceId: string
	date: string
}): Promise<{ slots: (TimeSlot & { workerId: string; workerName: string })[] }> {
	const { workers } = await getAvailableWorkers(input)

	const allSlots: (TimeSlot & { workerId: string; workerName: string })[] = []
	const seenTimes = new Set<string>()

	for (const worker of workers) {
		const { slots } = await getAvailableSlots({
			businessId: input.businessId,
			serviceId: input.serviceId,
			workerId: worker.id,
			date: input.date,
		})
		for (const slot of slots) {
			if (!seenTimes.has(slot.start)) {
				seenTimes.add(slot.start)
				allSlots.push({ ...slot, workerId: worker.id, workerName: worker.display_name })
			}
		}
	}

	allSlots.sort((a, b) => a.start.localeCompare(b.start))
	return { slots: allSlots }
}

// ── Create a booking ────────────────────────────────────────────────

export async function createBooking(input: {
	businessId: string
	serviceId: string
	workerId: string
	date: string
	startTime: string
	endTime: string
	note?: string
}): Promise<{ bookingId?: string; error?: string }> {
	const parsed = createBookingSchema.safeParse(input)
	if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

	const { businessId, serviceId, workerId, date, startTime, endTime, note } = parsed.data
	const { supabase, user } = await getAuthUser()
	if (!user) return { error: 'Not authenticated' }

	const { slots } = await getAvailableSlots({ businessId, serviceId, workerId, date })
	const slotAvailable = slots.some((s) => s.start === startTime && s.end === endTime)
	if (!slotAvailable) {
		return { error: 'This time slot is no longer available. Please select another time.' }
	}

	const { data: business } = await supabase
		.from('businesses')
		.select('auto_confirm')
		.eq('id', businessId)
		.single()

	const status = business?.auto_confirm ? 'confirmed' : 'pending'

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

export async function cancelBooking(input: {
	bookingId: string
	reason?: string
}): Promise<{ error?: string }> {
	const parsed = cancelBookingSchema.safeParse(input)
	if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

	const { bookingId, reason } = parsed.data
	const { supabase, user } = await getAuthUser()
	if (!user) return { error: 'Not authenticated' }

	// Verify user is the client or business owner of this booking
	const { data: booking } = await supabase
		.from('bookings')
		.select('client_id, business_id')
		.eq('id', bookingId)
		.single()

	if (!booking) return { error: 'Booking not found' }

	const isClient = booking.client_id === user.id
	const isOwner = await verifyBusinessOwner(supabase, booking.business_id, user.id)
	if (!isClient && !isOwner) return { error: 'Not authorized to cancel this booking' }

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

// ── Reschedule a booking ────────────────────────────────────────────

export async function rescheduleBooking(input: {
	bookingId: string
	workerId: string
	date: string
	startTime: string
	endTime: string
}): Promise<{ error?: string }> {
	const parsed = rescheduleBookingSchema.safeParse(input)
	if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

	const { bookingId, workerId, date, startTime, endTime } = parsed.data
	const { supabase, user } = await getAuthUser()
	if (!user) return { error: 'Not authenticated' }

	const { data: booking } = await supabase
		.from('bookings')
		.select('client_id, business_id, service_id, status')
		.eq('id', bookingId)
		.single()

	if (!booking) return { error: 'Booking not found' }

	const isClient = booking.client_id === user.id
	const isOwner = await verifyBusinessOwner(supabase, booking.business_id, user.id)
	if (!isClient && !isOwner) return { error: 'Not authorized to reschedule this booking' }

	if (booking.status === 'cancelled' || booking.status === 'completed' || booking.status === 'no_show') {
		return { error: 'Cannot reschedule a booking that is already ' + booking.status }
	}

	const { slots } = await getAvailableSlots({
		businessId: booking.business_id,
		serviceId: booking.service_id,
		workerId,
		date,
	})

	const slotAvailable = slots.some((s) => s.start === startTime && s.end === endTime)
	if (!slotAvailable) {
		return { error: 'This time slot is no longer available.' }
	}

	const { data: business } = await supabase
		.from('businesses')
		.select('auto_confirm')
		.eq('id', booking.business_id)
		.single()

	const newStatus = business?.auto_confirm ? 'confirmed' : 'pending'

	const { error } = await supabase
		.from('bookings')
		.update({
			worker_id: workerId,
			date,
			start_time: startTime,
			end_time: endTime,
			status: newStatus,
			updated_at: new Date().toISOString(),
		})
		.eq('id', bookingId)

	if (error) return { error: error.message }

	revalidatePath('/dashboard/bookings')
	return {}
}

// ── Toggle favorite ─────────────────────────────────────────────────

export async function toggleFavorite(businessId: string): Promise<{ isFavorited: boolean; error?: string }> {
	const parsed = businessIdSchema.safeParse(businessId)
	if (!parsed.success) return { isFavorited: false, error: 'Invalid business ID' }

	const { supabase, user } = await getAuthUser()
	if (!user) return { isFavorited: false, error: 'Not authenticated' }

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

export async function submitReview(input: {
	bookingId: string
	businessId: string
	rating: number
	comment?: string
}): Promise<{ error?: string }> {
	const parsed = submitReviewSchema.safeParse(input)
	if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

	const { bookingId, businessId, rating, comment } = parsed.data
	const { supabase, user } = await getAuthUser()
	if (!user) return { error: 'Not authenticated' }

	// Verify user is the client of this booking and it's completed
	const { data: booking } = await supabase
		.from('bookings')
		.select('client_id, status')
		.eq('id', bookingId)
		.single()

	if (!booking) return { error: 'Booking not found' }
	if (booking.client_id !== user.id) return { error: 'Not authorized to review this booking' }
	if (booking.status !== 'completed') return { error: 'Can only review completed bookings' }

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

export async function respondToReview(input: {
	reviewId: string
	response: string
}): Promise<{ error?: string }> {
	const parsed = respondToReviewSchema.safeParse(input)
	if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

	const { reviewId, response } = parsed.data
	const { supabase, user } = await getAuthUser()
	if (!user) return { error: 'Not authenticated' }

	// Verify user owns the business this review belongs to
	const { data: review } = await supabase
		.from('reviews')
		.select('business_id')
		.eq('id', reviewId)
		.single()

	if (!review) return { error: 'Review not found' }

	const isOwner = await verifyBusinessOwner(supabase, review.business_id, user.id)
	if (!isOwner) return { error: 'Not authorized to respond to this review' }

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
	const parsed = notificationIdSchema.safeParse(notificationId)
	if (!parsed.success) return { error: 'Invalid notification ID' }

	const { supabase, user } = await getAuthUser()
	if (!user) return { error: 'Not authenticated' }

	// Only mark own notifications as read
	const { error } = await supabase
		.from('notifications')
		.update({ is_read: true })
		.eq('id', notificationId)
		.eq('user_id', user.id)

	if (error) return { error: error.message }
	return {}
}

export async function markAllNotificationsRead(): Promise<{ error?: string }> {
	const { supabase, user } = await getAuthUser()
	if (!user) return { error: 'Not authenticated' }

	const { error } = await supabase
		.from('notifications')
		.update({ is_read: true })
		.eq('user_id', user.id)
		.eq('is_read', false)

	if (error) return { error: error.message }
	return {}
}
