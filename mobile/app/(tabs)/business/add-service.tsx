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
import type { Worker } from '../../../lib/types'

const DURATIONS = [15, 30, 45, 60, 90, 120, 180, 240]

export default function AddServiceScreen() {
	const { user } = useAuth()
	const router = useRouter()
	const { id } = useLocalSearchParams<{ id?: string }>()
	const isEdit = !!id

	const [loading, setLoading] = useState(isEdit)
	const [saving, setSaving] = useState(false)
	const [businessId, setBusinessId] = useState<string | null>(null)
	const [workers, setWorkers] = useState<Pick<Worker, 'id' | 'display_name' | 'is_active'>[]>([])
	const [selectedWorkerIds, setSelectedWorkerIds] = useState<Set<string>>(new Set())
	const [form, setForm] = useState({
		name: '',
		description: '',
		price: '',
		duration_minutes: 30,
		is_active: true,
	})

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

				// Load active workers for this business
				const { data: workersData } = await supabase
					.from('workers')
					.select('id, display_name, is_active')
					.eq('business_id', biz.id)
					.eq('is_active', true)
					.order('created_at')
				setWorkers(workersData ?? [])
			}

			if (id) {
				const { data } = await supabase.from('services').select('*').eq('id', id).single()
				if (data) {
					setForm({
						name: data.name,
						description: data.description ?? '',
						price: data.price.toString(),
						duration_minutes: data.duration_minutes,
						is_active: data.is_active,
					})
				}

				// Load existing worker assignments
				const { data: sw } = await supabase
					.from('service_workers')
					.select('worker_id')
					.eq('service_id', id)
				if (sw) {
					setSelectedWorkerIds(new Set(sw.map((r) => r.worker_id)))
				}
			}
			setLoading(false)
		}
		load()
	}, [user, id])

	function toggleWorker(workerId: string) {
		setSelectedWorkerIds((prev) => {
			const next = new Set(prev)
			if (next.has(workerId)) {
				next.delete(workerId)
			} else {
				next.add(workerId)
			}
			return next
		})
	}

	async function handleSave() {
		if (!form.name.trim()) {
			Alert.alert('Error', 'Service name is required')
			return
		}
		const price = parseFloat(form.price)
		if (isNaN(price) || price < 0.01) {
			Alert.alert('Error', 'Please enter a valid price')
			return
		}
		if (!businessId) return

		setSaving(true)
		const payload = {
			name: form.name.trim(),
			description: form.description.trim() || null,
			price,
			duration_minutes: form.duration_minutes,
			is_active: form.is_active,
		}

		let serviceId = id

		if (isEdit) {
			const { error } = await supabase.from('services').update(payload).eq('id', id)
			if (error) {
				setSaving(false)
				Alert.alert('Error', error.message)
				return
			}
		} else {
			const { data, error } = await supabase
				.from('services')
				.insert({ ...payload, business_id: businessId })
				.select('id')
				.single()
			if (error || !data) {
				setSaving(false)
				Alert.alert('Error', error?.message ?? 'Failed to create service')
				return
			}
			serviceId = data.id
		}

		// Sync worker assignments
		if (serviceId) {
			// Delete existing assignments
			await supabase.from('service_workers').delete().eq('service_id', serviceId)

			// Insert new assignments
			if (selectedWorkerIds.size > 0) {
				const rows = Array.from(selectedWorkerIds).map((workerId) => ({
					service_id: serviceId,
					worker_id: workerId,
				}))
				await supabase.from('service_workers').insert(rows)
			}
		}

		setSaving(false)
		router.back()
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
					<Text style={styles.label}>Service name</Text>
					<TextInput
						style={styles.input}
						value={form.name}
						onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
						placeholder="Haircut"
						placeholderTextColor={colors.foregroundSecondary}
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.label}>Description</Text>
					<TextInput
						style={[styles.input, styles.textarea]}
						value={form.description}
						onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
						placeholder="Describe this service..."
						placeholderTextColor={colors.foregroundSecondary}
						multiline
						numberOfLines={3}
						textAlignVertical="top"
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.label}>Price ($)</Text>
					<TextInput
						style={styles.input}
						value={form.price}
						onChangeText={(v) => setForm((p) => ({ ...p, price: v }))}
						placeholder="25.00"
						placeholderTextColor={colors.foregroundSecondary}
						keyboardType="decimal-pad"
					/>
				</View>

				<View style={styles.field}>
					<Text style={styles.label}>Duration</Text>
					<View style={styles.durationRow}>
						{DURATIONS.map((d) => (
							<TouchableOpacity
								key={d}
								style={[styles.durationChip, form.duration_minutes === d && styles.durationChipActive]}
								onPress={() => setForm((p) => ({ ...p, duration_minutes: d }))}
								activeOpacity={0.7}
							>
								<Text style={[styles.durationText, form.duration_minutes === d && styles.durationTextActive]}>
									{d >= 60 ? `${d / 60}h` : `${d}m`}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				<View style={styles.toggleRow}>
					<View style={{ flex: 1 }}>
						<Text style={styles.label}>Active</Text>
						<Text style={styles.toggleHint}>Visible to clients for booking</Text>
					</View>
					<Switch
						value={form.is_active}
						onValueChange={(v) => setForm((p) => ({ ...p, is_active: v }))}
						trackColor={{ false: colors.border, true: colors.primary + '80' }}
						thumbColor={form.is_active ? colors.primary : colors.foregroundSecondary}
					/>
				</View>

				{/* Worker Assignments */}
				{workers.length > 0 && (
					<View style={styles.workersSection}>
						<Text style={styles.label}>Assigned Workers</Text>
						<Text style={styles.toggleHint}>Select which workers can perform this service</Text>
						<View style={styles.workersList}>
							{workers.map((worker) => (
								<TouchableOpacity
									key={worker.id}
									style={[styles.workerChip, selectedWorkerIds.has(worker.id) && styles.workerChipActive]}
									onPress={() => toggleWorker(worker.id)}
									activeOpacity={0.7}
								>
									<View style={[styles.checkbox, selectedWorkerIds.has(worker.id) && styles.checkboxActive]}>
										{selectedWorkerIds.has(worker.id) && (
											<Text style={styles.checkmark}>✓</Text>
										)}
									</View>
									<Text style={[styles.workerName, selectedWorkerIds.has(worker.id) && styles.workerNameActive]}>
										{worker.display_name}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>
				)}

				<TouchableOpacity
					style={[styles.button, saving && styles.buttonDisabled]}
					onPress={handleSave}
					disabled={saving}
					activeOpacity={0.8}
				>
					{saving ? (
						<ActivityIndicator color={colors.white} size="small" />
					) : (
						<Text style={styles.buttonText}>{isEdit ? 'Update Service' : 'Create Service'}</Text>
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
	durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
	durationChip: {
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.sm,
		borderRadius: radius.full,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.surface,
	},
	durationChipActive: {
		backgroundColor: colors.primaryLight,
		borderColor: colors.primary,
	},
	durationText: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foregroundSecondary },
	durationTextActive: { color: colors.primary },
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
	toggleHint: { fontSize: fontSize.xs, color: colors.foregroundSecondary, marginTop: 2 },
	workersSection: {
		gap: spacing.sm,
		marginBottom: spacing.lg,
	},
	workersList: {
		gap: spacing.sm,
		marginTop: spacing.sm,
	},
	workerChip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.md,
		padding: spacing.md,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.md,
		backgroundColor: colors.surface,
	},
	workerChipActive: {
		borderColor: colors.primary,
		backgroundColor: colors.primaryLight,
	},
	checkbox: {
		width: 20,
		height: 20,
		borderRadius: 4,
		borderWidth: 2,
		borderColor: colors.border,
		justifyContent: 'center',
		alignItems: 'center',
	},
	checkboxActive: {
		borderColor: colors.primary,
		backgroundColor: colors.primary,
	},
	checkmark: { fontSize: 12, color: colors.white, fontWeight: '700' },
	workerName: { fontSize: fontSize.sm, color: colors.foreground },
	workerNameActive: { fontWeight: '500', color: colors.primary },
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
