import { Ionicons } from '@expo/vector-icons'
import {
	ActivityIndicator,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { formatTime, type TimeSlot } from '../../lib/booking'
import { colors, fontSize, radius, spacing } from '../../lib/theme'
import type { BookingItem } from './booking-card'

interface RescheduleModalProps {
	visible: boolean
	rescheduleBookingItem: BookingItem | null
	dateOptions: { label: string; value: string }[]
	rescheduleDate: string | null
	rescheduleLoadingSlots: boolean
	rescheduleSlots: TimeSlot[]
	rescheduleSelectedSlot: TimeSlot | null
	rescheduleSubmitting: boolean
	onClose: () => void
	onDateSelect: (date: string) => void
	onSlotSelect: (slot: TimeSlot) => void
	onConfirm: () => void
}

export function RescheduleModal({
	visible,
	rescheduleBookingItem,
	dateOptions,
	rescheduleDate,
	rescheduleLoadingSlots,
	rescheduleSlots,
	rescheduleSelectedSlot,
	rescheduleSubmitting,
	onClose,
	onDateSelect,
	onSlotSelect,
	onConfirm,
}: RescheduleModalProps) {
	return (
		<Modal visible={visible} animationType="slide" transparent>
			<View style={styles.modalOverlay}>
				<View style={styles.modalContent}>
					<View style={styles.modalHeader}>
						<Text style={styles.modalTitle}>Reschedule Booking</Text>
						<TouchableOpacity onPress={onClose} activeOpacity={0.7}>
							<Ionicons name="close" size={24} color={colors.foreground} />
						</TouchableOpacity>
					</View>
					<Text style={styles.modalSubtitle}>Pick a new date and time</Text>

					{/* Date chips */}
					<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateChips}>
						{dateOptions.map((d) => (
							<TouchableOpacity
								key={d.value}
								style={[styles.dateChip, rescheduleDate === d.value && styles.dateChipActive]}
								onPress={() => onDateSelect(d.value)}
								activeOpacity={0.7}
							>
								<Text style={[styles.dateChipText, rescheduleDate === d.value && styles.dateChipTextActive]}>{d.label}</Text>
							</TouchableOpacity>
						))}
					</ScrollView>

					{/* Time slots */}
					<ScrollView style={styles.slotsScroll} contentContainerStyle={styles.slotsScrollContent}>
						{!rescheduleDate && (
							<View style={styles.placeholderBox}>
								<Ionicons name="calendar-outline" size={28} color={colors.border} />
								<Text style={styles.placeholderText}>Select a date to see times</Text>
							</View>
						)}
						{rescheduleDate && rescheduleLoadingSlots && (
							<View style={styles.placeholderBox}>
								<ActivityIndicator size="small" color={colors.primary} />
								<Text style={styles.placeholderText}>Loading times...</Text>
							</View>
						)}
						{rescheduleDate && !rescheduleLoadingSlots && rescheduleSlots.length === 0 && (
							<View style={styles.placeholderBox}>
								<Ionicons name="time-outline" size={28} color={colors.border} />
								<Text style={styles.placeholderText}>No available times</Text>
							</View>
						)}
						{rescheduleDate && !rescheduleLoadingSlots && rescheduleSlots.length > 0 && (
							<View style={styles.slotsGrid}>
								{rescheduleSlots.map((slot) => (
									<TouchableOpacity
										key={slot.start}
										style={[styles.slotChip, rescheduleSelectedSlot?.start === slot.start && styles.slotChipActive]}
										onPress={() => onSlotSelect(slot)}
										activeOpacity={0.7}
									>
										<Text style={[styles.slotChipText, rescheduleSelectedSlot?.start === slot.start && styles.slotChipTextActive]}>
											{formatTime(slot.start)}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						)}
					</ScrollView>

					{/* Confirm button */}
					<TouchableOpacity
						style={[styles.confirmBtn, (!rescheduleSelectedSlot || rescheduleSubmitting) && styles.confirmBtnDisabled]}
						onPress={onConfirm}
						disabled={!rescheduleSelectedSlot || rescheduleSubmitting}
						activeOpacity={0.8}
					>
						{rescheduleSubmitting ? (
							<ActivityIndicator size="small" color={colors.white} />
						) : (
							<Text style={styles.confirmBtnText}>Confirm New Time</Text>
						)}
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
	modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: spacing['2xl'], paddingTop: spacing.lg, paddingBottom: spacing['5xl'], maxHeight: '80%' },
	modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
	modalTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.foreground },
	modalSubtitle: { fontSize: fontSize.sm, color: colors.foregroundSecondary, marginBottom: spacing.lg },
	dateChips: { gap: spacing.sm, paddingVertical: spacing.sm },
	dateChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
	dateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
	dateChipText: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foreground },
	dateChipTextActive: { color: colors.white },
	slotsScroll: { maxHeight: 220, marginTop: spacing.md },
	slotsScrollContent: { paddingBottom: spacing.md },
	placeholderBox: { alignItems: 'center', paddingVertical: spacing['3xl'], gap: spacing.sm },
	placeholderText: { fontSize: fontSize.sm, color: colors.foregroundSecondary },
	slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
	slotChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
	slotChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
	slotChipText: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foreground },
	slotChipTextActive: { color: colors.white },
	confirmBtn: { backgroundColor: colors.primary, height: 48, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', marginTop: spacing.lg },
	confirmBtnDisabled: { opacity: 0.5 },
	confirmBtnText: { fontSize: fontSize.base, fontWeight: '600', color: colors.white },
})
