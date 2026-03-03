// Shared formatting functions for the mobile app

import type { BusinessHours } from './types'

/** Convert "HH:MM" string to total minutes since midnight */
export function timeToMinutes(time: string): number {
	const parts = time.split(':')
	return Number(parts[0]) * 60 + Number(parts[1])
}

/** Convert total minutes since midnight to "HH:MM" string */
export function minutesToTime(minutes: number): string {
	const h = Math.floor(minutes / 60)
	const m = minutes % 60
	return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

/** Format 24h "HH:MM" time string to 12h AM/PM display */
export function formatTime(time: string): string {
	const [h, m] = time.split(':').map(Number)
	const ampm = h >= 12 ? 'PM' : 'AM'
	const hour = h % 12 || 12
	return m === 0 ? `${hour}:00 ${ampm}` : `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

/** Format duration in minutes to human-readable string (e.g. "1h 30min") */
export function formatDuration(minutes: number): string {
	if (minutes < 60) return `${minutes}min`
	const h = Math.floor(minutes / 60)
	const m = minutes % 60
	return m > 0 ? `${h}h ${m}min` : `${h}h`
}

/** Get uppercase initials from a name (max 2 characters) */
export function getInitials(name: string): string {
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)
}

/** Check if a business is currently open based on its hours */
export function isOpenNow(hours: BusinessHours[]): boolean {
	const now = new Date()
	const today = now.getDay()
	const todayHours = hours.find((h) => h.day_of_week === today)
	if (!todayHours || todayHours.is_closed) return false
	const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
	return currentTime >= todayHours.open_time && currentTime < todayHours.close_time
}

/** Format a Date object to "YYYY-MM-DD" string */
export function formatDateStr(d: Date): string {
	return d.toISOString().split('T')[0] ?? ''
}
