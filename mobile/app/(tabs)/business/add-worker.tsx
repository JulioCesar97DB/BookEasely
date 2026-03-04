import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
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

export default function AddWorkerScreen() {
	const { user } = useAuth()
	const router = useRouter()
	const navigation = useNavigation()
	const { businessId, id } = useLocalSearchParams<{ businessId: string; id?: string }>()
	const isEditMode = !!id

	const [saving, setSaving] = useState(false)
	const [loadingWorker, setLoadingWorker] = useState(isEditMode)
	const [form, setForm] = useState({
		phone: '',
		display_name: '',
		bio: '',
		specialties: '',
	})

	// Set header title based on mode
	useEffect(() => {
		navigation.setOptions({ title: isEditMode ? 'Edit Worker' : 'Add Worker' })
	}, [isEditMode, navigation])

	// Load existing worker data in edit mode
	useEffect(() => {
		if (!isEditMode || !id) return
		async function loadWorker() {
			const { data: worker } = await supabase
				.from('workers')
				.select('display_name, bio, specialties')
				.eq('id', id)
				.single()
			if (worker) {
				setForm({
					phone: '',
					display_name: worker.display_name ?? '',
					bio: worker.bio ?? '',
					specialties: worker.specialties?.join(', ') ?? '',
				})
			}
			setLoadingWorker(false)
		}
		loadWorker()
	}, [id, isEditMode])

	async function handleSave() {
		if (!form.display_name.trim()) {
			Alert.alert('Error', 'Display name is required')
			return
		}
		if (!businessId || !user) return

		const specialties = form.specialties
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)

		setSaving(true)

		if (isEditMode) {
			// Update existing worker
			const { error } = await supabase
				.from('workers')
				.update({
					display_name: form.display_name.trim(),
					bio: form.bio.trim() || null,
					specialties: specialties.length > 0 ? specialties : null,
				})
				.eq('id', id)

			setSaving(false)
			if (error) {
				Alert.alert('Error', error.message)
				return
			}
			Alert.alert('Success', 'Worker updated successfully!', [
				{ text: 'OK', onPress: () => router.back() },
			])
			return
		}

		// Invite flow — phone is required
		if (!form.phone.trim()) {
			setSaving(false)
			Alert.alert('Error', 'Phone number is required')
			return
		}

		const phone = form.phone.trim()

		// Check if already invited
		const { data: existingInvite } = await supabase
			.from('worker_invitations')
			.select('id, status')
			.eq('phone', phone)
			.eq('business_id', businessId)
			.single()

		if (existingInvite) {
			setSaving(false)
			if (existingInvite.status === 'pending') {
				Alert.alert('Error', 'This phone already has a pending invitation')
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
			.eq('phone', phone)
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
				phone,
				display_name: form.display_name.trim(),
				bio: form.bio.trim() || null,
				specialties: specialties.length > 0 ? specialties : null,
				invited_by: user.id,
				status: 'accepted',
				accepted_at: new Date().toISOString(),
			})

			// Notify the worker they've been added
			const { data: biz } = await supabase.from('businesses').select('name').eq('id', businessId).single()
			await supabase.from('notifications').insert({
				user_id: existingProfile.id,
				type: 'worker_added',
				title: 'Added to team',
				message: `You were added as a worker at ${biz?.name ?? 'a business'}`,
				data: { business_id: businessId },
			})

			setSaving(false)
			Alert.alert('Success', 'Worker added successfully!', [
				{ text: 'OK', onPress: () => router.back() },
			])
		} else {
			// User doesn't exist — create pending invitation
			const { error: inviteError } = await supabase.from('worker_invitations').insert({
				business_id: businessId,
				phone,
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

	if (loadingWorker) {
		return (
			<View style={styles.loadingContainer}>
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
				{!isEditMode && (
					<View style={styles.field}>
						<Text style={styles.label}>Phone number</Text>
						<TextInput
							style={styles.input}
							value={form.phone}
							onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))}
							placeholder="+1 (555) 000-0000"
							placeholderTextColor={colors.foregroundSecondary}
							keyboardType="phone-pad"
							autoCapitalize="none"
							autoCorrect={false}
						/>
						<Text style={styles.hint}>
							If they have an account, they'll be added instantly. Otherwise, they'll be linked when they sign up.
						</Text>
					</View>
				)}

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
					onPress={handleSave}
					disabled={saving}
					activeOpacity={0.8}
				>
					{saving ? (
						<ActivityIndicator color={colors.white} size="small" />
					) : (
						<Text style={styles.buttonText}>
							{isEditMode ? 'Save Changes' : 'Send Invitation'}
						</Text>
					)}
				</TouchableOpacity>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
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
