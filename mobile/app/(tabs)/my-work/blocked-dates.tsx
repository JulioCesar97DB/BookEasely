import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	FlatList,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { supabase } from '../../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../../lib/theme'
import type { WorkerBlockedDate } from '../../../lib/types'

export default function WorkerBlockedDatesScreen() {
	const router = useRouter()
	const { workerId, workerName } = useLocalSearchParams<{ workerId: string; workerName: string }>()
	const [loading, setLoading] = useState(true)
	const [dates, setDates] = useState<WorkerBlockedDate[]>([])
	const [adding, setAdding] = useState(false)
	const [newDate, setNewDate] = useState('')
	const [newReason, setNewReason] = useState('')
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		if (!workerId) return
		loadDates()
	}, [workerId])

	async function loadDates() {
		const { data } = await supabase
			.from('worker_blocked_dates')
			.select('*')
			.eq('worker_id', workerId)
			.order('date')
		setDates(data ?? [])
		setLoading(false)
	}

	async function handleAdd() {
		if (!newDate.trim() || !workerId) {
			Alert.alert('Error', 'Please enter a date (YYYY-MM-DD)')
			return
		}

		const dateRegex = /^\d{4}-\d{2}-\d{2}$/
		if (!dateRegex.test(newDate.trim())) {
			Alert.alert('Error', 'Date format must be YYYY-MM-DD')
			return
		}

		setSaving(true)
		const { error } = await supabase.from('worker_blocked_dates').insert({
			worker_id: workerId,
			date: newDate.trim(),
			reason: newReason.trim() || null,
		})

		setSaving(false)
		if (error) {
			Alert.alert('Error', error.message)
		} else {
			setNewDate('')
			setNewReason('')
			setAdding(false)
			await loadDates()
		}
	}

	function handleDelete(id: string, date: string) {
		Alert.alert('Remove Blocked Date', `Remove ${date}?`, [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Remove',
				style: 'destructive',
				onPress: async () => {
					const { error } = await supabase.from('worker_blocked_dates').delete().eq('id', id)
					if (error) {
						Alert.alert('Error', error.message)
					} else {
						setDates((prev) => prev.filter((d) => d.id !== id))
					}
				},
			},
		])
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
			<FlatList
				data={dates}
				keyExtractor={(item) => item.id}
				contentContainerStyle={dates.length === 0 && !adding ? styles.emptyContainer : styles.list}
				ListHeaderComponent={
					<>
						<Text style={styles.subtitle}>{workerName ?? 'Your'} — Time Off</Text>
						{adding ? (
							<View style={styles.addForm}>
								<View style={styles.field}>
									<Text style={styles.fieldLabel}>Date</Text>
									<TextInput
										style={styles.input}
										value={newDate}
										onChangeText={setNewDate}
										placeholder="YYYY-MM-DD"
										placeholderTextColor={colors.foregroundSecondary}
									/>
								</View>
								<View style={styles.field}>
									<Text style={styles.fieldLabel}>Reason (optional)</Text>
									<TextInput
										style={styles.input}
										value={newReason}
										onChangeText={setNewReason}
										placeholder="Vacation, personal day, etc."
										placeholderTextColor={colors.foregroundSecondary}
									/>
								</View>
								<View style={styles.addFormActions}>
									<TouchableOpacity
										style={styles.cancelButton}
										onPress={() => { setAdding(false); setNewDate(''); setNewReason('') }}
										activeOpacity={0.7}
									>
										<Text style={styles.cancelButtonText}>Cancel</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={[styles.saveButton, saving && styles.buttonDisabled]}
										onPress={handleAdd}
										disabled={saving}
										activeOpacity={0.8}
									>
										{saving ? (
											<ActivityIndicator color={colors.white} size="small" />
										) : (
											<Text style={styles.saveButtonText}>Add</Text>
										)}
									</TouchableOpacity>
								</View>
							</View>
						) : (
							<TouchableOpacity
								style={styles.addButton}
								onPress={() => setAdding(true)}
								activeOpacity={0.7}
							>
								<Ionicons name="add-circle-outline" size={18} color={colors.primary} />
								<Text style={styles.addButtonText}>Add blocked date</Text>
							</TouchableOpacity>
						)}
					</>
				}
				ListEmptyComponent={
					!adding ? (
						<View style={styles.emptyState}>
							<Ionicons name="calendar-outline" size={48} color={colors.border} />
							<Text style={styles.emptyTitle}>No blocked dates</Text>
							<Text style={styles.emptySubtitle}>
								Add dates when you&apos;re not available
							</Text>
						</View>
					) : null
				}
				renderItem={({ item }) => (
					<View style={styles.dateCard}>
						<View style={styles.dateInfo}>
							<Text style={styles.dateText}>{item.date}</Text>
							{item.reason && (
								<Text style={styles.reasonText}>{item.reason}</Text>
							)}
						</View>
						<TouchableOpacity
							onPress={() => handleDelete(item.id, item.date)}
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<Ionicons name="trash-outline" size={18} color={colors.destructive} />
						</TouchableOpacity>
					</View>
				)}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	list: { padding: spacing['2xl'], gap: spacing.md },
	emptyContainer: { flex: 1, padding: spacing['2xl'] },
	subtitle: {
		fontSize: fontSize.sm,
		color: colors.foregroundSecondary,
		marginBottom: spacing.lg,
	},
	addButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
		padding: spacing.lg,
		borderWidth: 1,
		borderStyle: 'dashed',
		borderColor: colors.primary,
		borderRadius: radius.md,
		marginBottom: spacing.md,
	},
	addButtonText: { fontSize: fontSize.sm, fontWeight: '500', color: colors.primary },
	addForm: {
		backgroundColor: colors.surface,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		padding: spacing.lg,
		marginBottom: spacing.md,
		gap: spacing.md,
	},
	field: { gap: spacing.xs },
	fieldLabel: { fontSize: fontSize.xs, fontWeight: '500', color: colors.foreground },
	input: {
		height: 44,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.sm,
		paddingHorizontal: spacing.md,
		fontSize: fontSize.sm,
		color: colors.foreground,
		backgroundColor: colors.background,
	},
	addFormActions: {
		flexDirection: 'row',
		gap: spacing.md,
		marginTop: spacing.xs,
	},
	cancelButton: {
		flex: 1,
		height: 40,
		borderRadius: radius.sm,
		borderWidth: 1,
		borderColor: colors.border,
		justifyContent: 'center',
		alignItems: 'center',
	},
	cancelButtonText: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foregroundSecondary },
	saveButton: {
		flex: 1,
		height: 40,
		borderRadius: radius.sm,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
	saveButtonText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.white },
	buttonDisabled: { opacity: 0.7 },
	emptyState: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		gap: spacing.md,
		paddingBottom: 80,
	},
	emptyTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.foregroundSecondary },
	emptySubtitle: {
		fontSize: fontSize.sm,
		color: colors.foregroundSecondary,
		textAlign: 'center',
		paddingHorizontal: spacing['4xl'],
	},
	dateCard: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: spacing.lg,
		backgroundColor: colors.surface,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
	},
	dateInfo: { flex: 1 },
	dateText: { fontSize: fontSize.base, fontWeight: '600', color: colors.foreground },
	reasonText: { fontSize: fontSize.sm, color: colors.foregroundSecondary, marginTop: 2 },
})
