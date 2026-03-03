// Shared constants for the mobile app

import { colors } from './theme'

export const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const
export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export const BOOKING_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
	pending: { bg: colors.warningLight, text: colors.warningDark },
	confirmed: { bg: colors.infoLight, text: colors.infoDark },
	completed: { bg: colors.successLight, text: colors.successDark },
	cancelled: { bg: colors.blockedRedLight, text: colors.dangerDark },
	no_show: { bg: colors.mutedLight, text: colors.muted },
}

export const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'] as const

export const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'] as const
