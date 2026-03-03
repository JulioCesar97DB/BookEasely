import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { formatDuration, formatTime } from '../../lib/format'
import type { TimeSlot } from '../../lib/booking'
import { colors, fontSize, radius, spacing } from '../../lib/theme'
import type { Service } from '../../lib/types'

interface ConfirmStepProps {
	businessName: string
	selectedService: Service
	resolvedWorkerName: string
	selectedDate: string
	selectedSlot: TimeSlot
	note: string
	onNoteChange: (text: string) => void
	submitting: boolean
	onConfirm: () => void
}

function SummaryRow({ label, value }: { label: string; value: string }) {
	return (
		<View style={styles.summaryRow}>
			<Text style={styles.summaryLabel}>{label}</Text>
			<Text style={styles.summaryValue}>{value}</Text>
		</View>
	)
}

export function ConfirmStep({
	businessName,
	selectedService,
	resolvedWorkerName,
	selectedDate,
	selectedSlot,
	note,
	onNoteChange,
	submitting,
	onConfirm,
}: ConfirmStepProps) {
	return (
		<>
			<Text style={styles.stepTitle}>Confirm Booking</Text>
			<View style={styles.summaryCard}>
				<SummaryRow label="Business" value={businessName} />
				<SummaryRow label="Service" value={selectedService.name} />
				<SummaryRow label="Professional" value={resolvedWorkerName} />
				<SummaryRow label="Date" value={new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} />
				<SummaryRow label="Time" value={`${formatTime(selectedSlot.start)} - ${formatTime(selectedSlot.end)}`} />
				<SummaryRow label="Duration" value={formatDuration(selectedService.duration_minutes)} />
				<View style={styles.summaryDivider} />
				<View style={styles.summaryRow}>
					<Text style={styles.summaryLabelBold}>Total</Text>
					<Text style={styles.summaryValueBold}>${Number(selectedService.price).toFixed(2)}</Text>
				</View>
			</View>

			<Text style={styles.noteLabel}>Note (optional)</Text>
			<TextInput
				style={styles.noteInput}
				placeholder="Special requests..."
				placeholderTextColor={colors.foregroundSecondary}
				value={note}
				onChangeText={onNoteChange}
				multiline
			/>

			<TouchableOpacity
				style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
				onPress={onConfirm}
				disabled={submitting}
				activeOpacity={0.8}
			>
				{submitting ? (
					<ActivityIndicator size="small" color={colors.white} />
				) : (
					<Text style={styles.primaryButtonText}>Confirm Booking - ${Number(selectedService.price).toFixed(0)}</Text>
				)}
			</TouchableOpacity>
		</>
	)
}

const styles = StyleSheet.create({
	stepTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.foreground, marginBottom: spacing.sm },
	summaryCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.lg },
	summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
	summaryLabel: { fontSize: fontSize.sm, color: colors.foregroundSecondary },
	summaryValue: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foreground },
	summaryLabelBold: { fontSize: fontSize.sm, fontWeight: '600', color: colors.foreground },
	summaryValueBold: { fontSize: fontSize.lg, fontWeight: '700', color: colors.foreground },
	summaryDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
	noteLabel: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foreground, marginBottom: spacing.xs },
	noteInput: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, fontSize: fontSize.sm, color: colors.foreground, minHeight: 80, textAlignVertical: 'top', marginBottom: spacing.lg },
	primaryButton: { backgroundColor: colors.primary, height: 48, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg },
	primaryButtonDisabled: { opacity: 0.6 },
	primaryButtonText: { fontSize: fontSize.base, fontWeight: '600', color: colors.white },
})
