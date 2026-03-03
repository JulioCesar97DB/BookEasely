// Shared booking logic for mobile - time slot generation

import { timeToMinutes, minutesToTime } from './format'
export { formatTime, formatDuration } from './format'
import { supabase } from './supabase'

export interface TimeSlot {
	start: string // HH:MM
	end: string   // HH:MM
}

function subtractRange(
	windows: [number, number][],
	removeStart: number,
	removeEnd: number
): [number, number][] {
	const result: [number, number][] = []
	for (const [wStart, wEnd] of windows) {
		if (removeEnd <= wStart || removeStart >= wEnd) {
			result.push([wStart, wEnd])
		} else {
			if (wStart < removeStart) result.push([wStart, removeStart])
			if (removeEnd < wEnd) result.push([removeEnd, wEnd])
		}
	}
	return result
}

export async function getAvailableSlots({
	businessId,
	serviceId,
	workerId,
	date,
}: {
	businessId: string
	serviceId: string
	workerId: string
	date: string
}): Promise<TimeSlot[]> {
	const [{ data: service }, { data: business }, { data: availability }, { data: bookings }, { data: blocked }] =
		await Promise.all([
			supabase.from('services').select('duration_minutes').eq('id', serviceId).single(),
			supabase.from('businesses').select('buffer_minutes').eq('id', businessId).single(),
			supabase.from('worker_availability').select('start_time, end_time').eq('worker_id', workerId).eq('day_of_week', new Date(date + 'T12:00:00').getDay()).eq('is_active', true),
			supabase.from('bookings').select('start_time, end_time').eq('worker_id', workerId).eq('date', date).in('status', ['pending', 'confirmed']),
			supabase.from('worker_blocked_dates').select('date, start_time, end_time').eq('worker_id', workerId).eq('date', date),
		])

	if (!service || !availability || availability.length === 0) return []

	const durationMinutes = service.duration_minutes
	const bufferMinutes = business?.buffer_minutes ?? 0

	let freeWindows: [number, number][] = availability.map((a) => [
		timeToMinutes(a.start_time),
		timeToMinutes(a.end_time),
	])

	// Check full-day block
	if (blocked?.some((b) => b.date === date && !b.start_time && !b.end_time)) return []

	// Subtract partial blocks
	for (const b of blocked ?? []) {
		if (b.date !== date || !b.start_time || !b.end_time) continue
		freeWindows = subtractRange(freeWindows, timeToMinutes(b.start_time), timeToMinutes(b.end_time))
	}

	// Subtract existing bookings
	for (const bk of bookings ?? []) {
		freeWindows = subtractRange(freeWindows, timeToMinutes(bk.start_time) - bufferMinutes, timeToMinutes(bk.end_time) + bufferMinutes)
	}

	const slots: TimeSlot[] = []
	for (const [wStart, wEnd] of freeWindows) {
		let s = wStart
		while (s + durationMinutes <= wEnd) {
			slots.push({ start: minutesToTime(s), end: minutesToTime(s + durationMinutes) })
			s += durationMinutes + bufferMinutes
		}
	}
	return slots
}

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
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

	// Verify slot still available
	const slots = await getAvailableSlots({ businessId, serviceId, workerId, date })
	if (!slots.some((s) => s.start === startTime && s.end === endTime)) {
		return { error: 'This time slot is no longer available.' }
	}

	const { data: business } = await supabase.from('businesses').select('auto_confirm').eq('id', businessId).single()
	const status = business?.auto_confirm ? 'confirmed' : 'pending'

	const { data, error } = await supabase
		.from('bookings')
		.insert({ client_id: user.id, business_id: businessId, worker_id: workerId, service_id: serviceId, date, start_time: startTime, end_time: endTime, status, note: note || null })
		.select('id')
		.single()

	if (error) return { error: error.message }
	return { bookingId: data.id }
}

export async function getAvailableSlotsAnyWorker({
	businessId,
	serviceId,
	date,
}: {
	businessId: string
	serviceId: string
	date: string
}): Promise<{ slots: (TimeSlot & { workerId: string; workerName: string })[] }> {
	const { data: serviceWorkerRows } = await supabase
		.from('service_workers')
		.select('worker_id, workers(id, display_name, is_active)')
		.eq('service_id', serviceId)

	if (!serviceWorkerRows) return { slots: [] }

	type WorkerInfo = { id: string; display_name: string; is_active: boolean }
	const activeWorkers = serviceWorkerRows
		.map((sw) => sw.workers as unknown as WorkerInfo | null)
		.filter((w): w is WorkerInfo => w !== null && w.is_active)

	const allSlots: (TimeSlot & { workerId: string; workerName: string })[] = []
	const seenTimes = new Set<string>()

	for (const worker of activeWorkers) {
		const slots = await getAvailableSlots({ businessId, serviceId, workerId: worker.id, date })
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

export async function cancelBooking({ bookingId, reason }: { bookingId: string; reason?: string }): Promise<{ error?: string }> {
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }
	const { error } = await supabase
		.from('bookings')
		.update({
			status: 'cancelled' as const,
			cancelled_by: user.id,
			cancellation_reason: reason || null,
			updated_at: new Date().toISOString(),
		})
		.eq('id', bookingId)
	if (error) return { error: error.message }
	return {}
}

export async function rescheduleBooking({
	bookingId,
	workerId,
	date,
	startTime,
	endTime,
}: {
	bookingId: string
	workerId: string
	date: string
	startTime: string
	endTime: string
}): Promise<{ error?: string }> {
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated' }

	const { data: booking } = await supabase
		.from('bookings')
		.select('business_id, service_id, status')
		.eq('id', bookingId)
		.single()

	if (!booking) return { error: 'Booking not found' }
	if (['cancelled', 'completed', 'no_show'].includes(booking.status)) {
		return { error: `Cannot reschedule a ${booking.status} booking` }
	}

	const slots = await getAvailableSlots({
		businessId: booking.business_id,
		serviceId: booking.service_id,
		workerId,
		date,
	})

	if (!slots.some((s) => s.start === startTime && s.end === endTime)) {
		return { error: 'This time slot is no longer available.' }
	}

	const { data: business } = await supabase
		.from('businesses')
		.select('auto_confirm')
		.eq('id', booking.business_id)
		.single()

	const status = business?.auto_confirm ? 'confirmed' : 'pending'

	const { error } = await supabase
		.from('bookings')
		.update({ worker_id: workerId, date, start_time: startTime, end_time: endTime, status, updated_at: new Date().toISOString() })
		.eq('id', bookingId)

	if (error) return { error: error.message }
	return {}
}

