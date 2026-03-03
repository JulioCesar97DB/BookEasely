// Shared constants for the mobile app

export const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const
export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export const BOOKING_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
	pending: { bg: '#FEF3C7', text: '#92400E' },
	confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
	completed: { bg: '#D1FAE5', text: '#065F46' },
	cancelled: { bg: '#FEE2E2', text: '#991B1B' },
	no_show: { bg: '#F3F4F6', text: '#374151' },
}

export const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'] as const

export const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'] as const
