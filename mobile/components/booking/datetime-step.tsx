import { Ionicons } from '@expo/vector-icons'
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { formatTime, type TimeSlot } from '../../lib/booking'
import { colors, fontSize, radius, spacing } from '../../lib/theme'
import type { Service, Worker } from '../../lib/types'

interface DateTimeStepProps {
	selectedService: Service
	selectedWorker: Worker | null
	anyWorkerMode: boolean
	dateOptions: { label: string; value: string }[]
	selectedDate: string | null
	loadingSlots: boolean
	availableSlots: TimeSlot[]
	selectedSlot: TimeSlot | null
	onSelectDate: (date: string) => void
	onSelectSlot: (slot: TimeSlot) => void
}

export function DateTimeStep({
	selectedService,
	selectedWorker,
	anyWorkerMode,
	dateOptions,
	selectedDate,
	loadingSlots,
	availableSlots,
	selectedSlot,
	onSelectDate,
	onSelectSlot,
}: DateTimeStepProps) {
	return (
		<>
			<Text style={styles.stepTitle}>Select Date & Time</Text>
			<Text style={styles.stepSubtitle}>{selectedService.name} with {anyWorkerMode ? 'any available professional' : selectedWorker?.display_name}</Text>

			{/* Date Chips */}
			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateChips}>
				{dateOptions.map((d) => (
					<TouchableOpacity
						key={d.value}
						style={[styles.dateChip, selectedDate === d.value && styles.dateChipActive]}
						onPress={() => onSelectDate(d.value)}
						activeOpacity={0.7}
					>
						<Text style={[styles.dateChipText, selectedDate === d.value && styles.dateChipTextActive]}>{d.label}</Text>
					</TouchableOpacity>
				))}
			</ScrollView>

			{/* Time Slots */}
			{!selectedDate && (
				<View style={styles.placeholderBox}>
					<Ionicons name="calendar-outline" size={32} color={colors.border} />
					<Text style={styles.placeholderText}>Select a date to see times</Text>
				</View>
			)}
			{selectedDate && loadingSlots && (
				<View style={styles.placeholderBox}>
					<ActivityIndicator size="small" color={colors.primary} />
					<Text style={styles.placeholderText}>Loading times...</Text>
				</View>
			)}
			{selectedDate && !loadingSlots && availableSlots.length === 0 && (
				<View style={styles.placeholderBox}>
					<Ionicons name="time-outline" size={32} color={colors.border} />
					<Text style={styles.placeholderText}>No available times</Text>
				</View>
			)}
			{selectedDate && !loadingSlots && availableSlots.length > 0 && (
				<View style={styles.slotsGrid}>
					{availableSlots.map((slot) => (
						<TouchableOpacity
							key={slot.start}
							style={[styles.slotChip, selectedSlot?.start === slot.start && styles.slotChipActive]}
							onPress={() => onSelectSlot(slot)}
							activeOpacity={0.7}
						>
							<Text style={[styles.slotChipText, selectedSlot?.start === slot.start && styles.slotChipTextActive]}>
								{formatTime(slot.start)}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			)}
		</>
	)
}

const styles = StyleSheet.create({
	stepTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.foreground, marginBottom: spacing.sm },
	stepSubtitle: { fontSize: fontSize.sm, color: colors.foregroundSecondary, marginBottom: spacing.lg },
	dateChips: { gap: spacing.sm, paddingVertical: spacing.md },
	dateChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
	dateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
	dateChipText: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foreground },
	dateChipTextActive: { color: colors.white },
	placeholderBox: { alignItems: 'center', paddingVertical: spacing['5xl'], gap: spacing.sm },
	placeholderText: { fontSize: fontSize.sm, color: colors.foregroundSecondary },
	slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
	slotChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
	slotChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
	slotChipText: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foreground },
	slotChipTextActive: { color: colors.white },
})
