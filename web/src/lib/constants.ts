export const DAYS_FULL = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
] as const

export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export const BOOKING_STATUSES = [
	'pending',
	'confirmed',
	'completed',
	'cancelled',
	'no_show',
] as const

export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export const BOOKING_STATUS_COLORS: Record<string, string> = {
	pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
	confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
	completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
	cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
	no_show: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

export const DURATION_OPTIONS = [
	{ value: 15, label: '15 min' },
	{ value: 30, label: '30 min' },
	{ value: 45, label: '45 min' },
	{ value: 60, label: '1 hour' },
	{ value: 90, label: '1h 30min' },
	{ value: 120, label: '2 hours' },
	{ value: 180, label: '3 hours' },
	{ value: 240, label: '4 hours' },
] as const

export const SCHEDULE_HOURS = Array.from({ length: 11 }, (_, i) => i + 7) as number[]

export const CALENDAR_HOURS = Array.from({ length: 15 }, (_, i) => i + 6) as number[] // 6 AM to 8 PM
export const HALF_HOUR_HEIGHT = 40 // pixels per 30-min slot

export const SCHEDULE_CHART_COLORS = [
	{ bg: 'bg-chart-1', text: 'text-chart-1' },
	{ bg: 'bg-chart-2', text: 'text-chart-2' },
	{ bg: 'bg-chart-3', text: 'text-chart-3' },
	{ bg: 'bg-chart-4', text: 'text-chart-4' },
	{ bg: 'bg-chart-5', text: 'text-chart-5' },
] as const
