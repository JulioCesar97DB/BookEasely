import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { formatTime } from '../../lib/format'
import type { TimeSlot } from '../../lib/booking'
import { colors, fontSize, radius, spacing } from '../../lib/theme'
import type { Service } from '../../lib/types'

interface SuccessStepProps {
	autoConfirm: boolean
	businessName: string
	selectedService: Service | null
	resolvedWorkerName: string
	selectedDate: string | null
	selectedSlot: TimeSlot | null
	onViewBookings: () => void
	onGoBack: () => void
}

function SummaryRow({ label, value }: { label: string; value: string }) {
	return (
		<View style={styles.summaryRow}>
			<Text style={styles.summaryLabel}>{label}</Text>
			<Text style={styles.summaryValue}>{value}</Text>
		</View>
	)
}

export function SuccessStep({
	autoConfirm,
	businessName,
	selectedService,
	resolvedWorkerName,
	selectedDate,
	selectedSlot,
	onViewBookings,
	onGoBack,
}: SuccessStepProps) {
	return (
		<View style={styles.successContainer}>
			<View style={styles.successIcon}>
				<Ionicons name="checkmark-circle" size={64} color={colors.success} />
			</View>
			<Text style={styles.successTitle}>
				Booking {autoConfirm ? 'Confirmed' : 'Requested'}!
			</Text>
			<Text style={styles.successSubtitle}>
				{autoConfirm
					? 'Your appointment has been confirmed.'
					: 'The business will confirm your booking shortly.'}
			</Text>
			<View style={styles.summaryCard}>
				<SummaryRow label="Business" value={businessName} />
				<SummaryRow label="Service" value={selectedService?.name ?? ''} />
				<SummaryRow label="Professional" value={resolvedWorkerName || 'Assigned professional'} />
				<SummaryRow label="Date" value={selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''} />
				<SummaryRow label="Time" value={selectedSlot ? `${formatTime(selectedSlot.start)} - ${formatTime(selectedSlot.end)}` : ''} />
			</View>
			<TouchableOpacity style={styles.primaryButton} onPress={onViewBookings} activeOpacity={0.8}>
				<Text style={styles.primaryButtonText}>View My Bookings</Text>
			</TouchableOpacity>
			<TouchableOpacity onPress={onGoBack} activeOpacity={0.7}>
				<Text style={styles.linkText}>Back to Business</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing['2xl'] },
	successIcon: { marginBottom: spacing.lg },
	successTitle: { fontSize: fontSize['2xl'], fontWeight: '700', color: colors.foreground, marginBottom: spacing.sm },
	successSubtitle: { fontSize: fontSize.sm, color: colors.foregroundSecondary, textAlign: 'center', marginBottom: spacing['2xl'] },
	summaryCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.lg, width: '100%' },
	summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
	summaryLabel: { fontSize: fontSize.sm, color: colors.foregroundSecondary },
	summaryValue: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foreground },
	primaryButton: { backgroundColor: colors.primary, height: 48, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg, width: '100%' },
	primaryButtonText: { fontSize: fontSize.base, fontWeight: '600', color: colors.white },
	linkText: { fontSize: fontSize.sm, color: colors.primary, textAlign: 'center', fontWeight: '500' },
})
