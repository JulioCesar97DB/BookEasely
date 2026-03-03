import React, { useMemo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { formatTime } from '../../lib/booking'
import { BOOKING_STATUS_COLORS } from '../../lib/constants'
import { colors, fontSize, radius, spacing } from '../../lib/theme'

export interface BookingItem {
	id: string
	date: string
	start_time: string
	end_time: string
	status: string
	business_id: string
	service_id: string
	worker_id: string
	services: { name: string; price: number } | null
	businesses: { name: string; slug: string } | null
	workers: { display_name: string } | null
}

interface BookingCardProps {
	item: BookingItem
	today: string
	onCancel: (bookingId: string) => void
	onReschedule: (item: BookingItem) => void
}

export const BookingCard = React.memo(function BookingCard({ item, today, onCancel, onReschedule }: BookingCardProps) {
	const isPast = item.date < today || item.status === 'cancelled'
	const canCancel = (item.status === 'pending' || item.status === 'confirmed') && item.date >= today
	const canReschedule = (item.status === 'pending' || item.status === 'confirmed') && item.date >= today
	const statusColor = BOOKING_STATUS_COLORS[item.status] ?? { bg: '#F3F4F6', text: '#374151' }
	const dateObj = useMemo(() => new Date(item.date + 'T00:00:00'), [item.date])

	return (
		<View style={[styles.bookingCard, isPast && styles.bookingCardPast]}>
			<View style={styles.dateBox}>
				<Text style={styles.dateMonth}>{dateObj.toLocaleDateString('en-US', { month: 'short' })}</Text>
				<Text style={styles.dateDay}>{dateObj.getDate()}</Text>
			</View>
			<View style={styles.bookingInfo}>
				<Text style={styles.bookingBusiness}>{item.businesses?.name ?? 'Business'}</Text>
				<Text style={styles.bookingService}>
					{item.services?.name ?? 'Service'}{item.workers?.display_name ? ` with ${item.workers.display_name}` : ''}
				</Text>
				<Text style={styles.bookingTime}>
					{formatTime(item.start_time)} - {formatTime(item.end_time)}
				</Text>
			</View>
			<View style={styles.bookingRight}>
				<View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
					<Text style={[styles.statusText, { color: statusColor.text }]}>{item.status}</Text>
				</View>
				{canReschedule && (
					<TouchableOpacity onPress={() => onReschedule(item)} activeOpacity={0.7}>
						<Text style={styles.rescheduleText}>Reschedule</Text>
					</TouchableOpacity>
				)}
				{canCancel && (
					<TouchableOpacity onPress={() => onCancel(item.id)} activeOpacity={0.7}>
						<Text style={styles.cancelText}>Cancel</Text>
					</TouchableOpacity>
				)}
			</View>
		</View>
	)
})

const styles = StyleSheet.create({
	bookingCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.sm },
	bookingCardPast: { opacity: 0.6 },
	dateBox: { width: 44, height: 48, borderRadius: radius.sm, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
	dateMonth: { fontSize: 10, fontWeight: '500', color: colors.primary, textTransform: 'uppercase' },
	dateDay: { fontSize: fontSize.lg, fontWeight: '700', color: colors.primary },
	bookingInfo: { flex: 1 },
	bookingBusiness: { fontSize: fontSize.sm, fontWeight: '600', color: colors.foreground },
	bookingService: { fontSize: fontSize.xs, color: colors.foregroundSecondary, marginTop: 1 },
	bookingTime: { fontSize: fontSize.xs, color: colors.foregroundSecondary, marginTop: 2 },
	bookingRight: { alignItems: 'flex-end', gap: spacing.xs },
	statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
	statusText: { fontSize: 10, fontWeight: '600' },
	rescheduleText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '500' },
	cancelText: { fontSize: fontSize.xs, color: colors.destructive, fontWeight: '500' },
})
