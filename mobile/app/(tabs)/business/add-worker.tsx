import { useLocalSearchParams, useRouter } from 'expo-router'
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

export default function AddWorkerScreen() {
	const { user } = useAuth()
	const router = useRouter()
	const { id } = useLocalSearchParams<{ id?: string }>()
	const isEdit = !!id

	const [loading, setLoading] = useState(isEdit)
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState({
		display_name: '',
		bio: '',
		specialties: '',
		is_active: true,
	})

	useEffect(() => {
		if (!id) return
		async function load() {
			const { data } = await supabase.from('workers').select('*').eq('id', id).single()
			if (data) {
				setForm({
					display_name: data.display_name,
					bio: data.bio ?? '',
					specialties: data.specialties?.join(', ') ?? '',
					is_active: data.is_active,
				})
			}
			setLoading(false)
		}
		load()
	}, [id])

	async function handleSave() {
		if (!form.display_name.trim()) {
			Alert.alert('Error', 'Display name is required')
			return
		}

		setSaving(true)
		const specialties = form.specialties
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)

		const payload = {
			display_name: form.display_name.trim(),
			bio: form.bio.trim() || null,
			specialties: specialties.length > 0 ? specialties : null,
			is_active: form.is_active,
		}

		const { error } = isEdit
			? await supabase.from('workers').update(payload).eq('id', id)
			: await supabase.from('workers').insert(payload)

		setSaving(false)
		if (error) {
			Alert.alert('Error', error.message)
		} else {
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
					<Text style={styles.label}>Display name</Text>
					<TextInput
						style={styles.input}
						value={form.display_name}
						onChangeText={(v) => setForm((p) => ({ ...p, display_name: v }))}
						placeholder="John Doe"
						placeholderTextColor={colors.foregroundSecondary}
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.label}>Bio</Text>
					<TextInput
						style={[styles.input, styles.textarea]}
						value={form.bio}
						onChangeText={(v) => setForm((p) => ({ ...p, bio: v }))}
						placeholder="Brief description..."
						placeholderTextColor={colors.foregroundSecondary}
						multiline
						numberOfLines={3}
						textAlignVertical="top"
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.label}>Specialties</Text>
					<TextInput
						style={styles.input}
						value={form.specialties}
						onChangeText={(v) => setForm((p) => ({ ...p, specialties: v }))}
						placeholder="Haircuts, Coloring, Styling"
						placeholderTextColor={colors.foregroundSecondary}
					/>
					<Text style={styles.hint}>Separate with commas</Text>
				</View>

				<View style={styles.toggleRow}>
					<View style={{ flex: 1 }}>
						<Text style={styles.label}>Active</Text>
						<Text style={styles.hint}>Available for bookings</Text>
					</View>
					<Switch
						value={form.is_active}
						onValueChange={(v) => setForm((p) => ({ ...p, is_active: v }))}
						trackColor={{ false: colors.border, true: colors.primary + '80' }}
						thumbColor={form.is_active ? colors.primary : colors.foregroundSecondary}
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
						<Text style={styles.buttonText}>{isEdit ? 'Update Worker' : 'Add Worker'}</Text>
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
	textarea: { height: 80, paddingTop: spacing.md },
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
