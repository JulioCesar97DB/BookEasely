import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { supabase } from '../../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../../lib/theme'
import type { WorkerAvailability } from '../../../lib/types'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface AvailEntry {
	day_of_week: number
	start_time: string
	end_time: string
	is_active: boolean
}

export default function WorkerScheduleScreen() {
	const router = useRouter()
	const { workerId, workerName } = useLocalSearchParams<{ workerId: string; workerName: string }>()
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [availability, setAvailability] = useState<AvailEntry[]>([])

	useEffect(() => {
		if (!workerId) return
		async function load() {
			const { data } = await supabase
				.from('worker_availability')
				.select('*')
				.eq('worker_id', workerId)
				.order('day_of_week')

			setAvailability(
				DAYS.map((_, i) => {
					const existing = data?.find((a: WorkerAvailability) => a.day_of_week === i)
					return {
						day_of_week: i,
						start_time: existing?.start_time ?? '09:00',
						end_time: existing?.end_time ?? '17:00',
						is_active: existing?.is_active ?? (i !== 0 && i !== 6),
					}
				})
			)
			setLoading(false)
		}
		load()
	}, [workerId])

	function updateEntry(index: number, field: string, value: string | boolean) {
		setAvailability((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)))
	}

	async function handleSave() {
		if (!workerId) return
		setSaving(true)

		const rows = availability.map((a) => ({
			worker_id: workerId,
			day_of_week: a.day_of_week,
			start_time: a.start_time,
			end_time: a.end_time,
			is_active: a.is_active,
		}))

		const { error } = await supabase
			.from('worker_availability')
			.upsert(rows, { onConflict: 'worker_id,day_of_week' })

		setSaving(false)
		if (error) {
			Alert.alert('Error', error.message)
		} else {
			Alert.alert('Success', 'Availability updated')
			router.back()
		}
	}

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color={colors.primary} />
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
				<Text style={styles.subtitle}>{workerName ?? 'Your'} — Weekly Schedule</Text>

				{availability.map((entry, index) => (
					<View key={entry.day_of_week} style={styles.dayRow}>
						<View style={styles.dayHeader}>
							<Text style={styles.dayName}>{DAYS[index]}</Text>
							<View style={styles.toggleContainer}>
								<Text style={styles.toggleLabel}>{entry.is_active ? 'Available' : 'Off'}</Text>
								<Switch
									value={entry.is_active}
									onValueChange={(v) => updateEntry(index, 'is_active', v)}
									trackColor={{ false: colors.border, true: colors.primary + '80' }}
									thumbColor={entry.is_active ? colors.primary : colors.foregroundSecondary}
								/>
							</View>
						</View>
						{entry.is_active && (
							<View style={styles.timeRow}>
								<View style={styles.timeField}>
									<Text style={styles.timeLabel}>Start</Text>
									<TextInput
										style={styles.timeInput}
										value={entry.start_time}
										onChangeText={(v) => updateEntry(index, 'start_time', v)}
										placeholder="09:00"
										placeholderTextColor={colors.foregroundSecondary}
									/>
								</View>
								<Ionicons name="arrow-forward" size={16} color={colors.foregroundSecondary} style={{ marginTop: 20 }} />
								<View style={styles.timeField}>
									<Text style={styles.timeLabel}>End</Text>
									<TextInput
										style={styles.timeInput}
										value={entry.end_time}
										onChangeText={(v) => updateEntry(index, 'end_time', v)}
										placeholder="17:00"
										placeholderTextColor={colors.foregroundSecondary}
									/>
								</View>
							</View>
						)}
					</View>
				))}

				<TouchableOpacity
					style={[styles.button, saving && styles.buttonDisabled]}
					onPress={handleSave}
					disabled={saving}
					activeOpacity={0.8}
				>
					{saving ? (
						<ActivityIndicator color={colors.white} size="small" />
					) : (
						<Text style={styles.buttonText}>Save Availability</Text>
					)}
				</TouchableOpacity>
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	scroll: { padding: spacing['2xl'], paddingBottom: spacing['5xl'] },
	subtitle: {
		fontSize: fontSize.sm,
		color: colors.foregroundSecondary,
		marginBottom: spacing.xl,
	},
	dayRow: {
		backgroundColor: colors.surface,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		padding: spacing.lg,
		marginBottom: spacing.md,
	},
	dayHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	dayName: { fontSize: fontSize.base, fontWeight: '600', color: colors.foreground },
	toggleContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
	toggleLabel: { fontSize: fontSize.xs, color: colors.foregroundSecondary },
	timeRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.md,
		marginTop: spacing.md,
	},
	timeField: { flex: 1, gap: spacing.xs },
	timeLabel: { fontSize: fontSize.xs, color: colors.foregroundSecondary },
	timeInput: {
		height: 40,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.sm,
		paddingHorizontal: spacing.md,
		fontSize: fontSize.sm,
		color: colors.foreground,
		backgroundColor: colors.background,
		textAlign: 'center',
	},
	button: {
		height: 48,
		borderRadius: radius.md,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: spacing.lg,
	},
	buttonDisabled: { opacity: 0.7 },
	buttonText: { fontSize: fontSize.base, fontWeight: '600', color: colors.white },
})
