import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { InvitationCard } from '../../../components/workers/invitation-card'
import { WorkerCard } from '../../../components/workers/worker-card'
import { useAuth } from '../../../lib/auth-context'
import { handleSupabaseError } from '../../../lib/handle-error'
import { supabase } from '../../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../../lib/theme'
import type { Worker, WorkerAvailability, WorkerInvitation } from '../../../lib/types'

export default function WorkersScreen() {
	const { user, profile } = useAuth()
	const router = useRouter()
	const [workers, setWorkers] = useState<Worker[]>([])
	const [invitations, setInvitations] = useState<WorkerInvitation[]>([])
	const [availability, setAvailability] = useState<WorkerAvailability[]>([])
	const [serviceCounts, setServiceCounts] = useState<Record<string, number>>({})
	const [loading, setLoading] = useState(true)
	const [businessId, setBusinessId] = useState<string | null>(null)
	const ownerIsWorker = useMemo(() => workers.some((w) => w.user_id === user?.id), [workers, user?.id])

	const loadData = useCallback(async () => {
		if (!user) return
		const { data: biz, error: bizError } = await supabase
			.from('businesses')
			.select('id')
			.eq('owner_id', user.id)
			.single()
		if (handleSupabaseError(bizError, 'Loading business')) {
			setLoading(false)
			return
		}
		if (biz) {
			setBusinessId(biz.id)
			const [workersRes, invitesRes, availRes, swRes] = await Promise.all([
				supabase.from('workers').select('*').eq('business_id', biz.id).order('created_at'),
				supabase.from('worker_invitations').select('*').eq('business_id', biz.id).eq('status', 'pending').order('created_at'),
				supabase.from('worker_availability').select('*'),
				supabase.from('service_workers').select('worker_id'),
			])
			handleSupabaseError(workersRes.error, 'Loading workers')
			handleSupabaseError(invitesRes.error, 'Loading invitations')
			handleSupabaseError(availRes.error, 'Loading availability')
			handleSupabaseError(swRes.error, 'Loading service workers')
			setWorkers(workersRes.data ?? [])
			setInvitations(invitesRes.data ?? [])
			setAvailability(availRes.data ?? [])

			const counts: Record<string, number> = {}
			for (const sw of swRes.data ?? []) {
				counts[sw.worker_id] = (counts[sw.worker_id] ?? 0) + 1
			}
			setServiceCounts(counts)
		}
		setLoading(false)
	}, [user])

	useEffect(() => { loadData() }, [loadData])

	const handleAddSelf = useCallback(async () => {
		if (!businessId || !user) return
		const { error } = await supabase.from('workers').insert({
			business_id: businessId,
			user_id: user.id,
			display_name: profile?.full_name ?? 'Owner',
			is_active: true,
		})
		if (!error) loadData()
	}, [businessId, user, profile?.full_name, loadData])

	const handleCancelInvitation = useCallback((id: string) => {
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
	}, [loadData])

	const sections = useMemo(() => [
		...(workers.length > 0 ? [{ type: 'header' as const }] : []),
		...workers.map((w) => ({ type: 'worker' as const, data: w })),
		...(invitations.length > 0 ? [{ type: 'invitations-header' as const }] : []),
		...invitations.map((inv) => ({ type: 'invitation' as const, data: inv })),
	], [workers, invitations])

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
								onPress={() => router.push(`/(tabs)/business/add-worker?businessId=${businessId}` as `/${string}`)}
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
									onPress={() => router.push(`/(tabs)/business/add-worker?businessId=${businessId}` as `/${string}`)}
									activeOpacity={0.7}
								>
									<Ionicons name="mail-outline" size={18} color={colors.white} />
									<Text style={styles.inviteWorkerText}>Invite Worker</Text>
								</TouchableOpacity>
							</View>
						)
					}

					if (item.type === 'invitations-header') {
						return <Text style={styles.sectionTitle}>Pending Invitations</Text>
					}

					if (item.type === 'invitation') {
						return <InvitationCard invitation={item.data} onCancel={handleCancelInvitation} />
					}

					return (
						<WorkerCard
							worker={item.data}
							availability={availability}
							serviceCount={serviceCounts[item.data.id] ?? 0}
							businessId={businessId}
						/>
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
})
