// BookEasely - Time slot generation algorithm
// Calculates available booking slots for a given service, worker, and date

export interface TimeSlot {
	start: string  // HH:MM format
	end: string    // HH:MM format
}

interface AvailabilityWindow {
	start_time: string
	end_time: string
}

interface ExistingBooking {
	start_time: string
	end_time: string
}

interface BlockedDate {
	date: string
	start_time: string | null
	end_time: string | null
}

import { minutesToTime, timeToMinutes } from '@/lib/format'

/**
 * Generate available time slots for a specific worker on a specific date.
 *
 * Algorithm:
 * 1. Get worker's weekly availability for the given day of week
 * 2. Subtract blocked date ranges
 * 3. Subtract existing confirmed/pending bookings (with buffer)
 * 4. Split remaining windows into slots of the required duration
 */
export function generateTimeSlots({
	availability,
	existingBookings,
	blockedDates,
	date,
	durationMinutes,
	bufferMinutes = 0,
}: {
	availability: AvailabilityWindow[]
	existingBookings: ExistingBooking[]
	blockedDates: BlockedDate[]
	date: string  // YYYY-MM-DD
	durationMinutes: number
	bufferMinutes?: number
}): TimeSlot[] {
	if (availability.length === 0) return []

	// Build free windows from availability
	let freeWindows: [number, number][] = availability.map((a) => [
		timeToMinutes(a.start_time),
		timeToMinutes(a.end_time),
	])

	// Subtract full-day blocked dates
	const fullDayBlocked = blockedDates.some(
		(b) => b.date === date && b.start_time === null && b.end_time === null
	)
	if (fullDayBlocked) return []

	// Subtract partial blocked date ranges
	for (const blocked of blockedDates) {
		if (blocked.date !== date) continue
		if (blocked.start_time === null || blocked.end_time === null) continue
		const blockStart = timeToMinutes(blocked.start_time)
		const blockEnd = timeToMinutes(blocked.end_time)
		freeWindows = subtractRange(freeWindows, blockStart, blockEnd)
	}

	// Subtract existing bookings (with buffer on both sides)
	for (const booking of existingBookings) {
		const bookStart = timeToMinutes(booking.start_time) - bufferMinutes
		const bookEnd = timeToMinutes(booking.end_time) + bufferMinutes
		freeWindows = subtractRange(freeWindows, bookStart, bookEnd)
	}

	// Generate slots from remaining free windows
	const slots: TimeSlot[] = []
	const totalNeeded = durationMinutes

	for (const [windowStart, windowEnd] of freeWindows) {
		let slotStart = windowStart
		while (slotStart + totalNeeded <= windowEnd) {
			slots.push({
				start: minutesToTime(slotStart),
				end: minutesToTime(slotStart + durationMinutes),
			})
			// Advance by slot duration (no overlap)
			slotStart += durationMinutes + bufferMinutes
		}
	}

	return slots
}

/**
 * Subtract a range [removeStart, removeEnd) from a set of free windows.
 * Returns the remaining windows after subtraction.
 */
function subtractRange(
	windows: [number, number][],
	removeStart: number,
	removeEnd: number
): [number, number][] {
	const result: [number, number][] = []

	for (const [wStart, wEnd] of windows) {
		if (removeEnd <= wStart || removeStart >= wEnd) {
			// No overlap - keep window as is
			result.push([wStart, wEnd])
		} else {
			// There is overlap - split the window
			if (wStart < removeStart) {
				result.push([wStart, removeStart])
			}
			if (removeEnd < wEnd) {
				result.push([removeEnd, wEnd])
			}
		}
	}

	return result
}
