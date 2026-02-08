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
import { useAuth } from '../../../lib/auth-context'
import { supabase } from '../../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../../lib/theme'

export default function EditProfileScreen() {
	const { user } = useAuth()
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState({
		name: '',
		description: '',
		phone: '',
		email: '',
		website: '',
		address: '',
		city: '',
		state: '',
		zip_code: '',
	})

	useEffect(() => {
		if (!user) return
		async function load() {
			const { data } = await supabase
				.from('businesses')
				.select('*')
				.eq('owner_id', user!.id)
				.single()
			if (data) {
				setForm({
					name: data.name,
					description: data.description ?? '',
					phone: data.phone,
					email: data.email ?? '',
					website: data.website ?? '',
					address: data.address,
					city: data.city,
					state: data.state,
					zip_code: data.zip_code,
				})
			}
			setLoading(false)
		}
		load()
	}, [user])

	async function handleSave() {
		if (!form.name.trim()) {
			Alert.alert('Error', 'Business name is required')
			return
		}
		setSaving(true)
		const { error } = await supabase
			.from('businesses')
			.update({
				name: form.name.trim(),
				description: form.description.trim() || null,
				phone: form.phone.trim(),
				email: form.email.trim() || null,
				website: form.website.trim() || null,
				address: form.address.trim(),
				city: form.city.trim(),
				state: form.state.trim(),
				zip_code: form.zip_code.trim(),
			})
			.eq('owner_id', user!.id)

		setSaving(false)
		if (error) {
			Alert.alert('Error', error.message)
		} else {
			Alert.alert('Success', 'Profile updated')
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
					<Text style={styles.label}>Business name</Text>
					<TextInput
						style={styles.input}
						value={form.name}
						onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
						placeholder="My Business"
						placeholderTextColor={colors.foregroundSecondary}
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.label}>Description</Text>
					<TextInput
						style={[styles.input, styles.textarea]}
						value={form.description}
						onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
						placeholder="Tell clients about your business..."
						placeholderTextColor={colors.foregroundSecondary}
						multiline
						numberOfLines={4}
						textAlignVertical="top"
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.label}>Phone</Text>
					<TextInput
						style={styles.input}
						value={form.phone}
						onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))}
						placeholder="+1 (555) 000-0000"
						placeholderTextColor={colors.foregroundSecondary}
						keyboardType="phone-pad"
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.label}>Email</Text>
					<TextInput
						style={styles.input}
						value={form.email}
						onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
						placeholder="contact@business.com"
						placeholderTextColor={colors.foregroundSecondary}
						keyboardType="email-address"
						autoCapitalize="none"
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.label}>Website</Text>
					<TextInput
						style={styles.input}
						value={form.website}
						onChangeText={(v) => setForm((p) => ({ ...p, website: v }))}
						placeholder="https://mybusiness.com"
						placeholderTextColor={colors.foregroundSecondary}
						autoCapitalize="none"
					/>
				</View>

				<View style={styles.separator} />

				<View style={styles.field}>
					<Text style={styles.label}>Address</Text>
					<TextInput
						style={styles.input}
						value={form.address}
						onChangeText={(v) => setForm((p) => ({ ...p, address: v }))}
						placeholder="123 Main St"
						placeholderTextColor={colors.foregroundSecondary}
					/>
				</View>

				<View style={styles.fieldRow}>
					<View style={[styles.field, { flex: 2 }]}>
						<Text style={styles.label}>City</Text>
						<TextInput
							style={styles.input}
							value={form.city}
							onChangeText={(v) => setForm((p) => ({ ...p, city: v }))}
							placeholder="City"
							placeholderTextColor={colors.foregroundSecondary}
						/>
					</View>
					<View style={[styles.field, { flex: 1 }]}>
						<Text style={styles.label}>State</Text>
						<TextInput
							style={styles.input}
							value={form.state}
							onChangeText={(v) => setForm((p) => ({ ...p, state: v }))}
							placeholder="CA"
							placeholderTextColor={colors.foregroundSecondary}
						/>
					</View>
					<View style={[styles.field, { flex: 1 }]}>
						<Text style={styles.label}>ZIP</Text>
						<TextInput
							style={styles.input}
							value={form.zip_code}
							onChangeText={(v) => setForm((p) => ({ ...p, zip_code: v }))}
							placeholder="90210"
							placeholderTextColor={colors.foregroundSecondary}
							keyboardType="number-pad"
						/>
					</View>
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
	fieldRow: { flexDirection: 'row', gap: spacing.md },
	label: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foreground },
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
	textarea: { height: 100, paddingTop: spacing.md },
	separator: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
	button: {
		height: 48,
		borderRadius: radius.md,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: spacing.xl,
	},
	buttonDisabled: { opacity: 0.7 },
	buttonText: { fontSize: fontSize.base, fontWeight: '600', color: colors.white },
})
