import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { useAuth } from '../../../lib/auth-context'
import { supabase } from '../../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../../lib/theme'
import type { Worker, WorkerAvailability, WorkerInvitation } from '../../../lib/types'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getAvailabilitySummary(workerAvail: WorkerAvailability[]): string {
	const activeDays = workerAvail.filter((a) => a.is_active).sort((a, b) => a.day_of_week - b.day_of_week)
	if (activeDays.length === 0) return 'No schedule set'

	const times = activeDays[0]
	const timeStr = times ? `${times.start_time.slice(0, 5)}–${times.end_time.slice(0, 5)}` : ''
	const indices = activeDays.map((d) => d.day_of_week)

	if (indices.length >= 2) {
		const first = indices[0]!
		const last = indices[indices.length - 1]!
		const isConsecutive = indices.every((v, i) => v === first + i)
		if (isConsecutive) return `${DAYS[first]}–${DAYS[last]}, ${timeStr}`
	}
	return `${activeDays.length} days/week, ${timeStr}`
}

export default function WorkersScreen() {
	const { user, profile } = useAuth()
	const router = useRouter()
	const [workers, setWorkers] = useState<Worker[]>([])
	const [invitations, setInvitations] = useState<WorkerInvitation[]>([])
	const [availability, setAvailability] = useState<WorkerAvailability[]>([])
	const [serviceCounts, setServiceCounts] = useState<Record<string, number>>({})
	const [loading, setLoading] = useState(true)
	const [businessId, setBusinessId] = useState<string | null>(null)
	const ownerIsWorker = workers.some((w) => w.user_id === user?.id)

	const loadData = useCallback(async () => {
		if (!user) return
		const { data: biz } = await supabase
			.from('businesses')
			.select('id')
			.eq('owner_id', user.id)
			.single()
		if (biz) {
			setBusinessId(biz.id)
			const [workersRes, invitesRes, availRes, swRes] = await Promise.all([
				supabase.from('workers').select('*').eq('business_id', biz.id).order('created_at'),
				supabase.from('worker_invitations').select('*').eq('business_id', biz.id).eq('status', 'pending').order('created_at'),
				supabase.from('worker_availability').select('*'),
				supabase.from('service_workers').select('worker_id'),
			])
			setWorkers(workersRes.data ?? [])
			setInvitations(invitesRes.data ?? [])
			setAvailability(availRes.data ?? [])

			// Count services per worker
			const counts: Record<string, number> = {}
			for (const sw of swRes.data ?? []) {
				counts[sw.worker_id] = (counts[sw.worker_id] ?? 0) + 1
			}
			setServiceCounts(counts)
		}
		setLoading(false)
	}, [user])

	useEffect(() => { loadData() }, [loadData])

	async function handleAddSelf() {
		if (!businessId || !user) return
		const { error } = await supabase.from('workers').insert({
			business_id: businessId,
			user_id: user.id,
			display_name: profile?.full_name ?? 'Owner',
			is_active: true,
		})
		if (!error) loadData()
	}

	async function handleCancelInvitation(id: string) {
		Alert.alert('Cancel Invitation', 'Are you sure?', [
			{ text: 'No', style: 'cancel' },
			{
				text: 'Cancel Invitation',
				style: 'destructive',
				onPress: async () => {
					await supabase.from('worker_invitations').delete().eq('id', id)
					loadData()
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

	const sections = [
		...(workers.length > 0 ? [{ type: 'header' as const }] : []),
		...workers.map((w) => ({ type: 'worker' as const, data: w })),
		...(invitations.length > 0 ? [{ type: 'invitations-header' as const }] : []),
		...invitations.map((inv) => ({ type: 'invitation' as const, data: inv })),
	]

	return (
		<View style={styles.container}>
			<FlatList
				data={sections}
				keyExtractor={(item, index) => {
					if (item.type === 'header' || item.type === 'invitations-header') return item.type
					if (item.type === 'worker') return item.data.id
					if (item.type === 'invitation') return item.data.id
					return String(index)
				}}
				contentContainerStyle={workers.length === 0 && invitations.length === 0 ? styles.emptyContainer : styles.list}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<Ionicons name="people-outline" size={48} color={colors.border} />
						<Text style={styles.emptyTitle}>No team members yet</Text>
						<Text style={styles.emptySubtitle}>Add yourself or invite workers by email</Text>
						<View style={styles.emptyActions}>
							<TouchableOpacity style={styles.addButton} onPress={handleAddSelf} activeOpacity={0.8}>
								<Ionicons name="person-add" size={18} color={colors.white} />
								<Text style={styles.addButtonText}>Add Yourself</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.inviteButton}
								onPress={() => router.push(`/(tabs)/business/add-worker?businessId=${businessId}` as never)}
								activeOpacity={0.8}
							>
								<Ionicons name="mail-outline" size={18} color={colors.primary} />
								<Text style={styles.inviteButtonText}>Invite by Email</Text>
							</TouchableOpacity>
						</View>
					</View>
				}
				renderItem={({ item }) => {
					if (item.type === 'header') {
						return (
							<View style={styles.headerActions}>
								{!ownerIsWorker && (
									<TouchableOpacity style={styles.addSelfButton} onPress={handleAddSelf} activeOpacity={0.7}>
										<Ionicons name="person-add-outline" size={18} color={colors.primary} />
										<Text style={styles.addSelfText}>Add yourself as worker</Text>
									</TouchableOpacity>
								)}
								<TouchableOpacity
									style={styles.inviteWorkerButton}
									onPress={() => router.push(`/(tabs)/business/add-worker?businessId=${businessId}` as never)}
									activeOpacity={0.7}
								>
									<Ionicons name="mail-outline" size={18} color={colors.white} />
									<Text style={styles.inviteWorkerText}>Invite Worker</Text>
								</TouchableOpacity>
							</View>
						)
					}

					if (item.type === 'invitations-header') {
						return (
							<Text style={styles.sectionTitle}>Pending Invitations</Text>
						)
					}

					if (item.type === 'invitation') {
						const inv = item.data
						return (
							<View style={styles.invitationCard}>
								<View style={styles.invitationIcon}>
									<Ionicons name="mail-outline" size={18} color="#D97706" />
								</View>
								<View style={styles.invitationBody}>
									<Text style={styles.invitationName}>{inv.display_name}</Text>
									<Text style={styles.invitationEmail}>{inv.email}</Text>
								</View>
								<TouchableOpacity
									onPress={() => handleCancelInvitation(inv.id)}
									activeOpacity={0.6}
									style={styles.cancelButton}
								>
									<Ionicons name="close" size={18} color={colors.foregroundSecondary} />
								</TouchableOpacity>
							</View>
						)
					}

					// Worker card
					const worker = item.data
					const workerAvail = availability.filter((a) => a.worker_id === worker.id)
					const svcCount = serviceCounts[worker.id] ?? 0
					const availSummary = getAvailabilitySummary(workerAvail)

					return (
						<View style={styles.card}>
							<TouchableOpacity
								style={styles.cardMain}
								onPress={() => router.push(`/(tabs)/business/add-worker?id=${worker.id}&businessId=${businessId}` as never)}
								activeOpacity={0.7}
							>
								<View style={styles.avatar}>
									<Text style={styles.avatarText}>{worker.display_name.charAt(0).toUpperCase()}</Text>
								</View>
								<View style={styles.cardBody}>
									<View style={styles.cardNameRow}>
										<Text style={styles.cardName}>{worker.display_name}</Text>
										<View style={[styles.statusDot, worker.is_active ? styles.statusActive : styles.statusInactive]} />
									</View>
									{worker.bio && (
										<Text style={styles.cardBio} numberOfLines={1}>{worker.bio}</Text>
									)}

									{/* Stats row */}
									<View style={styles.statsRow}>
										<View style={styles.statPill}>
											<Ionicons name="clipboard-outline" size={11} color={colors.foregroundSecondary} />
											<Text style={styles.statText}>{svcCount} service{svcCount !== 1 ? 's' : ''}</Text>
										</View>
										<View style={styles.statPill}>
											<Ionicons name="time-outline" size={11} color={colors.foregroundSecondary} />
											<Text style={styles.statText}>{availSummary}</Text>
										</View>
									</View>

									{worker.specialties && worker.specialties.length > 0 && (
										<View style={styles.specialtiesRow}>
											{worker.specialties.slice(0, 3).map((spec) => (
												<View key={spec} style={styles.specBadge}>
													<Text style={styles.specText}>{spec}</Text>
												</View>
											))}
										</View>
									)}

									<Text style={styles.memberSince}>
										Since {new Date(worker.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
									</Text>
								</View>
							</TouchableOpacity>
							<View style={styles.cardActions}>
								<TouchableOpacity
									style={styles.actionButton}
									onPress={() => router.push(`/(tabs)/business/worker-availability?workerId=${worker.id}&workerName=${encodeURIComponent(worker.display_name)}` as never)}
									activeOpacity={0.7}
								>
									<Ionicons name="time-outline" size={15} color={colors.primary} />
									<Text style={styles.actionText}>Schedule</Text>
								</TouchableOpacity>
								<View style={styles.actionDivider} />
								<TouchableOpacity
									style={styles.actionButton}
									onPress={() => router.push(`/(tabs)/business/worker-blocked-dates?workerId=${worker.id}&workerName=${encodeURIComponent(worker.display_name)}` as never)}
									activeOpacity={0.7}
								>
									<Ionicons name="calendar-outline" size={15} color={colors.primary} />
									<Text style={styles.actionText}>Time Off</Text>
								</TouchableOpacity>
							</View>
						</View>
					)
				}}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	list: { padding: spacing['2xl'], gap: spacing.md },
	emptyContainer: { flex: 1 },
	emptyState: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		gap: spacing.md,
		paddingBottom: 80,
	},
	emptyTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.foregroundSecondary },
	emptySubtitle: { fontSize: fontSize.sm, color: colors.foregroundSecondary, textAlign: 'center', paddingHorizontal: spacing['4xl'] },
	emptyActions: { gap: spacing.sm, marginTop: spacing.md, width: '60%' },
	addButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing.sm,
		backgroundColor: colors.primary,
		paddingHorizontal: spacing.xl,
		paddingVertical: spacing.md,
		borderRadius: radius.md,
	},
	addButtonText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.white },
	inviteButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing.sm,
		paddingHorizontal: spacing.xl,
		paddingVertical: spacing.md,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.primary,
	},
	inviteButtonText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.primary },
	headerActions: { gap: spacing.sm, marginBottom: spacing.md },
	addSelfButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
		padding: spacing.lg,
		borderWidth: 1,
		borderStyle: 'dashed',
		borderColor: colors.primary,
		borderRadius: radius.md,
	},
	addSelfText: { fontSize: fontSize.sm, fontWeight: '500', color: colors.primary },
	inviteWorkerButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing.sm,
		padding: spacing.lg,
		backgroundColor: colors.primary,
		borderRadius: radius.md,
	},
	inviteWorkerText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.white },
	sectionTitle: {
		fontSize: fontSize.base,
		fontWeight: '600',
		color: colors.foreground,
		marginTop: spacing.xl,
		marginBottom: spacing.sm,
	},
	invitationCard: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: spacing.lg,
		backgroundColor: colors.surface,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		gap: spacing.md,
	},
	invitationIcon: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: '#FEF3C7',
		justifyContent: 'center',
		alignItems: 'center',
	},
	invitationBody: { flex: 1 },
	invitationName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.foreground },
	invitationEmail: { fontSize: fontSize.xs, color: colors.foregroundSecondary, marginTop: 1 },
	cancelButton: { padding: spacing.sm },
	card: {
		backgroundColor: colors.surface,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		overflow: 'hidden',
	},
	cardMain: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		padding: spacing.lg,
		gap: spacing.md,
	},
	avatar: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: colors.primaryLight,
		justifyContent: 'center',
		alignItems: 'center',
	},
	avatarText: { fontSize: fontSize.base, fontWeight: '600', color: colors.primary },
	cardBody: { flex: 1 },
	cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
	cardName: { fontSize: fontSize.base, fontWeight: '600', color: colors.foreground },
	cardBio: { fontSize: fontSize.sm, color: colors.foregroundSecondary, marginTop: 2 },
	statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
	statPill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
		paddingHorizontal: spacing.sm,
		paddingVertical: 2,
		borderRadius: radius.full,
		backgroundColor: colors.background,
	},
	statText: { fontSize: 10, color: colors.foregroundSecondary },
	specialtiesRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm, flexWrap: 'wrap' },
	specBadge: {
		paddingHorizontal: spacing.sm,
		paddingVertical: 2,
		borderRadius: radius.full,
		borderWidth: 1,
		borderColor: colors.border,
	},
	specText: { fontSize: 10, color: colors.foregroundSecondary },
	memberSince: { fontSize: 10, color: colors.foregroundSecondary, marginTop: spacing.sm, opacity: 0.6 },
	statusDot: { width: 8, height: 8, borderRadius: 4 },
	statusActive: { backgroundColor: '#30A46C' },
	statusInactive: { backgroundColor: colors.border },
	cardActions: {
		flexDirection: 'row',
		borderTopWidth: 1,
		borderTopColor: colors.border,
	},
	actionButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing.xs,
		paddingVertical: spacing.sm,
	},
	actionDivider: {
		width: 1,
		backgroundColor: colors.border,
	},
	actionText: { fontSize: fontSize.xs, fontWeight: '500', color: colors.primary },
})
