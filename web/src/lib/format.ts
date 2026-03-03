import type { BusinessHours } from '@/lib/types'

/**
 * Convert "HH:MM" or "HH:MM:SS" time string to 12-hour format (e.g. "9:00 AM")
 */
export function formatTime(time: string): string {
	const [h, m] = time.split(':').map(Number)
	const ampm = h >= 12 ? 'PM' : 'AM'
	const hour = h % 12 || 12
	return m === 0 ? `${hour}:00 ${ampm}` : `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

/**
 * Format a duration in minutes to a human-readable string (e.g. "1h 30min")
 */
export function formatDuration(minutes: number): string {
	if (minutes < 60) return `${minutes}min`
	const h = Math.floor(minutes / 60)
	const m = minutes % 60
	return m > 0 ? `${h}h ${m}min` : `${h}h`
}

/**
 * Get the initials of a name (e.g. "John Doe" -> "JD")
 */
export function getInitials(name: string): string {
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)
}

/**
 * Convert "HH:MM" or "HH:MM:SS" to minutes since midnight
 */
export function timeToMinutes(time: string): number {
	const parts = time.split(':')
	return Number(parts[0]) * 60 + Number(parts[1])
}

/**
 * Convert minutes since midnight to "HH:MM" format
 */
export function minutesToTime(minutes: number): string {
	const h = Math.floor(minutes / 60)
	const m = minutes % 60
	return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

/**
 * Check if a business is currently open based on its hours
 */
export function isOpenNow(hours: BusinessHours[]): boolean {
	const now = new Date()
	const today = now.getDay()
	const todayHours = hours.find((h) => h.day_of_week === today)
	if (!todayHours || todayHours.is_closed) return false

	const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
	return currentTime >= todayHours.open_time && currentTime < todayHours.close_time
}

/**
 * Format a Date to "YYYY-MM-DD" string
 */
export function formatDateStr(date: Date): string {
	return date.toISOString().split('T')[0] ?? ''
}

/**
 * Format an hour number to 12-hour label (e.g. 13 -> "1 PM")
 */
export function formatHour(hour: number): string {
	if (hour === 0) return '12 AM'
	if (hour < 12) return `${hour} AM`
	if (hour === 12) return '12 PM'
	return `${hour - 12} PM`
}
