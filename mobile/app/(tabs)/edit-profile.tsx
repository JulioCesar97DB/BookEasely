import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { useAuth } from '../../lib/auth-context'
import { supabase } from '../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../lib/theme'

export default function EditProfileScreen() {
	const { user, profile } = useAuth()
	const router = useRouter()
	const [saving, setSaving] = useState(false)
	const [loading, setLoading] = useState(true)
	const [form, setForm] = useState({
		full_name: '',
		phone: '',
	})

	useEffect(() => {
		if (profile) {
			setForm({
				full_name: profile.full_name || '',
				phone: profile.phone || '',
			})
			setLoading(false)
		}
	}, [profile])

	async function handleSave() {
		if (!form.full_name.trim()) {
			Alert.alert('Error', 'Name is required')
			return
		}
		if (!user) return

		setSaving(true)
		const { error } = await supabase
			.from('profiles')
			.update({
				full_name: form.full_name.trim(),
				phone: form.phone.trim(),
			})
			.eq('id', user.id)

		setSaving(false)
		if (error) {
			Alert.alert('Error', error.message)
		} else {
			Alert.alert('Success', 'Profile updated', [
				{ text: 'OK', onPress: () => router.back() },
			])
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
					<Text style={styles.label}>Full name</Text>
					<TextInput
						style={styles.input}
						value={form.full_name}
						onChangeText={(v) => setForm((p) => ({ ...p, full_name: v }))}
						placeholder="Your name"
						placeholderTextColor={colors.foregroundSecondary}
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.label}>Email</Text>
					<View style={styles.disabledInput}>
						<Text style={styles.disabledText}>{user?.email}</Text>
					</View>
					<Text style={styles.hint}>Email cannot be changed</Text>
				</View>

				<View style={styles.field}>
					<Text style={styles.label}>Phone</Text>
					<TextInput
						style={styles.input}
						value={form.phone}
						onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))}
						placeholder="(555) 123-4567"
						placeholderTextColor={colors.foregroundSecondary}
						keyboardType="phone-pad"
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
						<Text style={styles.buttonText}>Save Changes</Text>
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
	field: { gap: spacing.sm, marginBottom: spacing.lg },
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
	},
	disabledInput: {
		height: 48,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.md,
		paddingHorizontal: spacing.lg,
		justifyContent: 'center',
		backgroundColor: colors.background,
	},
	disabledText: {
		fontSize: fontSize.base,
		color: colors.foregroundSecondary,
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
