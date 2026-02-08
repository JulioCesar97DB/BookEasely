import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { useAuth } from '../../../lib/auth-context'
import { supabase } from '../../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../../lib/theme'
import type { Worker } from '../../../lib/types'

export default function WorkersScreen() {
	const { user, profile } = useAuth()
	const router = useRouter()
	const [workers, setWorkers] = useState<Worker[]>([])
	const [loading, setLoading] = useState(true)
	const [businessId, setBusinessId] = useState<string | null>(null)
	const ownerIsWorker = workers.some((w) => w.user_id === user?.id)

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
				const { data } = await supabase
					.from('workers')
					.select('*')
					.eq('business_id', biz.id)
					.order('created_at')
				setWorkers(data ?? [])
			}
			setLoading(false)
		}
		load()
	}, [user])

	async function handleAddSelf() {
		if (!businessId || !user) return
		const { error } = await supabase.from('workers').insert({
			business_id: businessId,
			user_id: user.id,
			display_name: profile?.full_name ?? 'Owner',
			is_active: true,
		})
		if (!error) {
			const { data } = await supabase
				.from('workers')
				.select('*')
				.eq('business_id', businessId)
				.order('created_at')
			setWorkers(data ?? [])
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
		<View style={styles.container}>
			<FlatList
				data={workers}
				keyExtractor={(item) => item.id}
				contentContainerStyle={workers.length === 0 ? styles.emptyContainer : styles.list}
				ListHeaderComponent={
					!ownerIsWorker && workers.length > 0 ? (
						<TouchableOpacity style={styles.addSelfButton} onPress={handleAddSelf} activeOpacity={0.7}>
							<Ionicons name="person-add-outline" size={18} color={colors.primary} />
							<Text style={styles.addSelfText}>Add yourself as worker</Text>
						</TouchableOpacity>
					) : null
				}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<Ionicons name="people-outline" size={48} color={colors.border} />
						<Text style={styles.emptyTitle}>No team members yet</Text>
						<Text style={styles.emptySubtitle}>Add yourself as a worker to manage your schedule</Text>
						<TouchableOpacity style={styles.addButton} onPress={handleAddSelf} activeOpacity={0.8}>
							<Ionicons name="person-add" size={18} color={colors.white} />
							<Text style={styles.addButtonText}>Add Yourself</Text>
						</TouchableOpacity>
					</View>
				}
				renderItem={({ item }) => (
					<TouchableOpacity
						style={styles.card}
						onPress={() => router.push(`/(tabs)/business/add-worker?id=${item.id}` as never)}
						activeOpacity={0.7}
					>
						<View style={styles.avatar}>
							<Text style={styles.avatarText}>{item.display_name.charAt(0).toUpperCase()}</Text>
						</View>
						<View style={styles.cardBody}>
							<Text style={styles.cardName}>{item.display_name}</Text>
							{item.bio && (
								<Text style={styles.cardBio} numberOfLines={1}>{item.bio}</Text>
							)}
							{item.specialties && item.specialties.length > 0 && (
								<View style={styles.specialtiesRow}>
									{item.specialties.slice(0, 3).map((spec) => (
										<View key={spec} style={styles.specBadge}>
											<Text style={styles.specText}>{spec}</Text>
										</View>
									))}
								</View>
							)}
						</View>
						<View style={[styles.statusDot, item.is_active ? styles.statusActive : styles.statusInactive]} />
					</TouchableOpacity>
				)}
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
	addButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
		backgroundColor: colors.primary,
		paddingHorizontal: spacing.xl,
		paddingVertical: spacing.md,
		borderRadius: radius.md,
		marginTop: spacing.md,
	},
	addButtonText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.white },
	addSelfButton: {
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
	addSelfText: { fontSize: fontSize.sm, fontWeight: '500', color: colors.primary },
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: spacing.lg,
		backgroundColor: colors.surface,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
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
	cardName: { fontSize: fontSize.base, fontWeight: '600', color: colors.foreground },
	cardBio: { fontSize: fontSize.sm, color: colors.foregroundSecondary, marginTop: 2 },
	specialtiesRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs, flexWrap: 'wrap' },
	specBadge: {
		paddingHorizontal: spacing.sm,
		paddingVertical: 2,
		borderRadius: radius.full,
		borderWidth: 1,
		borderColor: colors.border,
	},
	specText: { fontSize: 10, color: colors.foregroundSecondary },
	statusDot: { width: 8, height: 8, borderRadius: 4 },
	statusActive: { backgroundColor: '#30A46C' },
	statusInactive: { backgroundColor: colors.border },
})
