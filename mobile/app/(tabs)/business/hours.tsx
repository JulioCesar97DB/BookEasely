import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
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
import { useAuth } from '../../../lib/auth-context'
import { supabase } from '../../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../../lib/theme'
import type { BusinessHours } from '../../../lib/types'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface HourEntry {
	day_of_week: number
	open_time: string
	close_time: string
	is_closed: boolean
}

export default function HoursScreen() {
	const { user } = useAuth()
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [businessId, setBusinessId] = useState<string | null>(null)
	const [hours, setHours] = useState<HourEntry[]>([])

	useEffect(() => {
		if (!user) return
		async function load() {
			const { data: biz } = await supabase
				.from('businesses')
				.select('id')
				.eq('owner_id', user!.id)
				.single()
			if (biz) {
				setBusinessId(biz.id)
				const { data } = await supabase
					.from('business_hours')
					.select('*')
					.eq('business_id', biz.id)
					.order('day_of_week')

				setHours(
					DAYS.map((_, i) => {
						const existing = data?.find((h: BusinessHours) => h.day_of_week === i)
						return {
							day_of_week: i,
							open_time: existing?.open_time ?? '09:00',
							close_time: existing?.close_time ?? '17:00',
							is_closed: existing?.is_closed ?? (i === 0),
						}
					})
				)
			}
			setLoading(false)
		}
		load()
	}, [user])

	function updateHour(index: number, field: string, value: string | boolean) {
		setHours((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)))
	}

	async function handleSave() {
		if (!businessId) return
		setSaving(true)

		const rows = hours.map((h) => ({
			business_id: businessId,
			day_of_week: h.day_of_week,
			open_time: h.open_time,
			close_time: h.close_time,
			is_closed: h.is_closed,
		}))

		const { error } = await supabase
			.from('business_hours')
			.upsert(rows, { onConflict: 'business_id,day_of_week' })

		setSaving(false)
		if (error) {
			Alert.alert('Error', error.message)
		} else {
			Alert.alert('Success', 'Business hours updated')
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
				{hours.map((hour, index) => (
					<View key={hour.day_of_week} style={styles.dayRow}>
						<View style={styles.dayHeader}>
							<Text style={styles.dayName}>{DAYS[index]}</Text>
							<View style={styles.toggleContainer}>
								<Text style={styles.toggleLabel}>{hour.is_closed ? 'Closed' : 'Open'}</Text>
								<Switch
									value={!hour.is_closed}
									onValueChange={(v) => updateHour(index, 'is_closed', !v)}
									trackColor={{ false: colors.border, true: colors.primary + '80' }}
									thumbColor={!hour.is_closed ? colors.primary : colors.foregroundSecondary}
								/>
							</View>
						</View>
						{!hour.is_closed && (
							<View style={styles.timeRow}>
								<View style={styles.timeField}>
									<Text style={styles.timeLabel}>Open</Text>
									<TextInput
										style={styles.timeInput}
										value={hour.open_time}
										onChangeText={(v) => updateHour(index, 'open_time', v)}
										placeholder="09:00"
										placeholderTextColor={colors.foregroundSecondary}
									/>
								</View>
								<Ionicons name="arrow-forward" size={16} color={colors.foregroundSecondary} style={{ marginTop: 20 }} />
								<View style={styles.timeField}>
									<Text style={styles.timeLabel}>Close</Text>
									<TextInput
										style={styles.timeInput}
										value={hour.close_time}
										onChangeText={(v) => updateHour(index, 'close_time', v)}
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
						<Text style={styles.buttonText}>Save Hours</Text>
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
