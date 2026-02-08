import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
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

export default function InviteWorkerScreen() {
	const { user } = useAuth()
	const router = useRouter()
	const { businessId } = useLocalSearchParams<{ businessId: string }>()

	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState({
		email: '',
		display_name: '',
		bio: '',
		specialties: '',
	})

	async function handleInvite() {
		if (!form.email.trim()) {
			Alert.alert('Error', 'Email is required')
			return
		}
		if (!form.display_name.trim()) {
			Alert.alert('Error', 'Display name is required')
			return
		}
		if (!businessId || !user) return

		setSaving(true)
		const email = form.email.trim().toLowerCase()
		const specialties = form.specialties
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)

		// Check if already invited
		const { data: existingInvite } = await supabase
			.from('worker_invitations')
			.select('id, status')
			.eq('email', email)
			.eq('business_id', businessId)
			.single()

		if (existingInvite) {
			setSaving(false)
			if (existingInvite.status === 'pending') {
				Alert.alert('Error', 'This email already has a pending invitation')
				return
			}
			if (existingInvite.status === 'accepted') {
				Alert.alert('Error', 'This person is already a worker')
				return
			}
		}

		// Check if user exists in platform
		const { data: existingProfile } = await supabase
			.from('profiles')
			.select('id')
			.eq('email', email)
			.single()

		if (existingProfile) {
			// Check if already a worker
			const { data: existingWorker } = await supabase
				.from('workers')
				.select('id')
				.eq('user_id', existingProfile.id)
				.eq('business_id', businessId)
				.single()

			if (existingWorker) {
				setSaving(false)
				Alert.alert('Error', 'This person is already a worker for your business')
				return
			}

			// Create worker directly
			const { error: workerError } = await supabase.from('workers').insert({
				business_id: businessId,
				user_id: existingProfile.id,
				display_name: form.display_name.trim(),
				bio: form.bio.trim() || null,
				specialties: specialties.length > 0 ? specialties : null,
				is_active: true,
			})

			if (workerError) {
				setSaving(false)
				Alert.alert('Error', workerError.message)
				return
			}

			// Record accepted invitation
			await supabase.from('worker_invitations').insert({
				business_id: businessId,
				email,
				display_name: form.display_name.trim(),
				bio: form.bio.trim() || null,
				specialties: specialties.length > 0 ? specialties : null,
				invited_by: user.id,
				status: 'accepted',
				accepted_at: new Date().toISOString(),
			})

			setSaving(false)
			Alert.alert('Success', 'Worker added successfully!', [
				{ text: 'OK', onPress: () => router.back() },
			])
		} else {
			// User doesn't exist — create pending invitation
			const { error: inviteError } = await supabase.from('worker_invitations').insert({
				business_id: businessId,
				email,
				display_name: form.display_name.trim(),
				bio: form.bio.trim() || null,
				specialties: specialties.length > 0 ? specialties : null,
				invited_by: user.id,
				status: 'pending',
			})

			setSaving(false)
			if (inviteError) {
				Alert.alert('Error', inviteError.message)
				return
			}

			Alert.alert(
				'Invitation Created',
				'They\'ll be added automatically when they sign up.',
				[{ text: 'OK', onPress: () => router.back() }],
			)
		}
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
					<Text style={styles.label}>Email</Text>
					<TextInput
						style={styles.input}
						value={form.email}
						onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
						placeholder="worker@example.com"
						placeholderTextColor={colors.foregroundSecondary}
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
					/>
					<Text style={styles.hint}>
						If they have an account, they'll be added instantly. Otherwise, they'll be linked when they sign up.
					</Text>
				</View>

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

				<TouchableOpacity
					style={[styles.button, saving && styles.buttonDisabled]}
					onPress={handleInvite}
					disabled={saving}
					activeOpacity={0.8}
				>
					{saving ? (
						<ActivityIndicator color={colors.white} size="small" />
					) : (
						<Text style={styles.buttonText}>Send Invitation</Text>
					)}
				</TouchableOpacity>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
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
