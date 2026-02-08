import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
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

export default function BusinessSettingsScreen() {
	const { user } = useAuth()
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [businessId, setBusinessId] = useState<string | null>(null)
	const [form, setForm] = useState({
		cancellation_policy: '',
		cancellation_hours: '24',
		buffer_minutes: '0',
		auto_confirm: true,
	})

	useEffect(() => {
		if (!user) return
		async function load() {
			const { data: biz } = await supabase
				.from('businesses')
				.select('id, cancellation_policy, cancellation_hours, buffer_minutes, auto_confirm')
				.eq('owner_id', user!.id)
				.single()

			if (biz) {
				setBusinessId(biz.id)
				setForm({
					cancellation_policy: biz.cancellation_policy ?? '',
					cancellation_hours: (biz.cancellation_hours ?? 24).toString(),
					buffer_minutes: (biz.buffer_minutes ?? 0).toString(),
					auto_confirm: biz.auto_confirm ?? true,
				})
			}
			setLoading(false)
		}
		load()
	}, [user])

	async function handleSave() {
		if (!businessId) return

		const cancellation_hours = parseInt(form.cancellation_hours, 10)
		const buffer_minutes = parseInt(form.buffer_minutes, 10)

		if (isNaN(cancellation_hours) || cancellation_hours < 0) {
			Alert.alert('Error', 'Cancellation hours must be a valid number')
			return
		}
		if (isNaN(buffer_minutes) || buffer_minutes < 0) {
			Alert.alert('Error', 'Buffer minutes must be a valid number')
			return
		}

		setSaving(true)
		const { error } = await supabase
			.from('businesses')
			.update({
				cancellation_policy: form.cancellation_policy.trim() || null,
				cancellation_hours,
				buffer_minutes,
				auto_confirm: form.auto_confirm,
			})
			.eq('id', businessId)

		setSaving(false)
		if (error) {
			Alert.alert('Error', error.message)
		} else {
			Alert.alert('Success', 'Settings updated')
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
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<ScrollView
				contentContainerStyle={styles.scroll}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.field}>
					<Text style={styles.label}>Cancellation Policy</Text>
					<TextInput
						style={[styles.input, styles.textarea]}
						value={form.cancellation_policy}
						onChangeText={(v) => setForm((p) => ({ ...p, cancellation_policy: v }))}
						placeholder="Describe your cancellation policy..."
						placeholderTextColor={colors.foregroundSecondary}
						multiline
						numberOfLines={4}
						textAlignVertical="top"
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.label}>Cancellation Window (hours)</Text>
					<Text style={styles.hint}>How many hours before the appointment can clients cancel</Text>
					<TextInput
						style={styles.input}
						value={form.cancellation_hours}
						onChangeText={(v) => setForm((p) => ({ ...p, cancellation_hours: v }))}
						placeholder="24"
						placeholderTextColor={colors.foregroundSecondary}
						keyboardType="number-pad"
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.label}>Buffer Time (minutes)</Text>
					<Text style={styles.hint}>Time between consecutive appointments</Text>
					<TextInput
						style={styles.input}
						value={form.buffer_minutes}
						onChangeText={(v) => setForm((p) => ({ ...p, buffer_minutes: v }))}
						placeholder="0"
						placeholderTextColor={colors.foregroundSecondary}
						keyboardType="number-pad"
					/>
				</View>

				<View style={styles.toggleRow}>
					<View style={{ flex: 1 }}>
						<Text style={styles.label}>Auto-Confirm Bookings</Text>
						<Text style={styles.hint}>Automatically confirm new bookings without manual review</Text>
					</View>
					<Switch
						value={form.auto_confirm}
						onValueChange={(v) => setForm((p) => ({ ...p, auto_confirm: v }))}
						trackColor={{ false: colors.border, true: colors.primary + '80' }}
						thumbColor={form.auto_confirm ? colors.primary : colors.foregroundSecondary}
					/>
				</View>

				<TouchableOpacity
					style={[styles.button, saving && styles.buttonDisabled]}
					onPress={handleSave}
					disabled={saving}
					activeOpacity={0.8}
				>
					{saving ? (
						<ActivityIndicator color={colors.white} size="small" />
					) : (
						<Text style={styles.buttonText}>Save Settings</Text>
					)}
				</TouchableOpacity>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	scroll: { padding: spacing['2xl'], paddingBottom: spacing['5xl'] },
	field: { gap: spacing.xs, marginBottom: spacing.lg },
	label: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foreground },
	hint: { fontSize: fontSize.xs, color: colors.foregroundSecondary },
	input: {
		height: 48,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.md,
		paddingHorizontal: spacing.lg,
		fontSize: fontSize.base,
		color: colors.foreground,
		backgroundColor: colors.surface,
		marginTop: spacing.xs,
	},
	textarea: { height: 100, paddingTop: spacing.md },
	toggleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: spacing.lg,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.md,
		backgroundColor: colors.surface,
		marginBottom: spacing.lg,
	},
	button: {
		height: 48,
		borderRadius: radius.md,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: spacing.md,
	},
	buttonDisabled: { opacity: 0.7 },
	buttonText: { fontSize: fontSize.base, fontWeight: '600', color: colors.white },
})
