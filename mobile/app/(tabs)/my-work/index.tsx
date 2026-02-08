import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { AnimatedScreen } from '../../../components/animated-screen'
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
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../../lib/auth-context'
import { supabase } from '../../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../../lib/theme'

interface WorkerRecord {
	id: string
	display_name: string
	business_id: string
	businesses: { name: string } | null
}

export default function MyWorkScreen() {
	const { user } = useAuth()
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [workers, setWorkers] = useState<WorkerRecord[]>([])
	const [todayCount, setTodayCount] = useState(0)
	const [upcomingCount, setUpcomingCount] = useState(0)

	useEffect(() => {
		if (!user) return
		async function load() {
			const { data: workerData } = await supabase
				.from('workers')
				.select('id, display_name, business_id, businesses(name)')
				.eq('user_id', user!.id)
				.eq('is_active', true)

			const records = (workerData ?? []) as unknown as WorkerRecord[]
			setWorkers(records)

			const workerIds = records.map((w) => w.id)
			if (workerIds.length > 0) {
				const today = new Date().toISOString().split('T')[0]!
				const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]!

				const [{ count: tc }, { count: uc }] = await Promise.all([
					supabase.from('bookings').select('id', { count: 'exact', head: true })
						.in('worker_id', workerIds).eq('date', today).in('status', ['pending', 'confirmed']),
					supabase.from('bookings').select('id', { count: 'exact', head: true })
						.in('worker_id', workerIds).gte('date', today).lte('date', nextWeek).in('status', ['pending', 'confirmed']),
				])
				setTodayCount(tc ?? 0)
				setUpcomingCount(uc ?? 0)
			}

			setLoading(false)
		}
		load()
	}, [user])

	if (loading) {
		return (
			<SafeAreaView style={styles.container} edges={['top']}>
				<View style={styles.centered}>
					<ActivityIndicator size="large" color={colors.primary} />
				</View>
			</SafeAreaView>
		)
	}

	return (
		<AnimatedScreen>
			<SafeAreaView style={styles.container} edges={['top']}>
				<View style={styles.header}>
					<Text style={styles.title}>My Work</Text>
				</View>

				{/* Stats Row */}
				<Animated.View entering={FadeInDown.delay(50).duration(200)} style={styles.statsRow}>
					<View style={styles.statCard}>
						<Text style={styles.statValue}>{todayCount}</Text>
						<Text style={styles.statLabel}>Today</Text>
					</View>
					<View style={styles.statCard}>
						<Text style={styles.statValue}>{upcomingCount}</Text>
						<Text style={styles.statLabel}>This Week</Text>
					</View>
					<View style={styles.statCard}>
						<Text style={styles.statValue}>{workers.length}</Text>
						<Text style={styles.statLabel}>Businesses</Text>
					</View>
				</Animated.View>

				{/* Quick Actions */}
				<Animated.View entering={FadeInDown.delay(100).duration(200)} style={styles.actionsRow}>
					<TouchableOpacity
						style={styles.actionBtn}
						activeOpacity={0.7}
						onPress={() => {
							if (workers.length > 0) {
								router.push({ pathname: '/(tabs)/my-work/schedule', params: { workerId: workers[0]!.id, workerName: workers[0]!.display_name } } as never)
							}
						}}
					>
						<View style={styles.actionIcon}>
							<Ionicons name="time-outline" size={20} color={colors.primary} />
						</View>
						<Text style={styles.actionText}>My Schedule</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.actionBtn}
						activeOpacity={0.7}
						onPress={() => {
							if (workers.length > 0) {
								router.push({ pathname: '/(tabs)/my-work/blocked-dates', params: { workerId: workers[0]!.id, workerName: workers[0]!.display_name } } as never)
							}
						}}
					>
						<View style={styles.actionIcon}>
							<Ionicons name="calendar-outline" size={20} color={colors.primary} />
						</View>
						<Text style={styles.actionText}>Time Off</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.actionBtn}
						activeOpacity={0.7}
						onPress={() => router.push('/(tabs)/my-work/appointments' as never)}
					>
						<View style={styles.actionIcon}>
							<Ionicons name="clipboard-outline" size={20} color={colors.primary} />
						</View>
						<Text style={styles.actionText}>Appointments</Text>
					</TouchableOpacity>
				</Animated.View>

				{/* Workplaces */}
				<Animated.View entering={FadeInDown.delay(150).duration(200)}>
					<Text style={styles.sectionTitle}>Your Workplaces</Text>
				</Animated.View>
				<FlatList
					data={workers}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.list}
					renderItem={({ item }) => (
						<View style={styles.businessCard}>
							<View style={styles.businessIcon}>
								<Ionicons name="storefront-outline" size={22} color={colors.primary} />
							</View>
							<View style={styles.businessInfo}>
								<Text style={styles.businessName}>{item.businesses?.name ?? 'Business'}</Text>
								<Text style={styles.businessRole}>as {item.display_name}</Text>
							</View>
							<View style={styles.workerBadge}>
								<Text style={styles.workerBadgeText}>Worker</Text>
							</View>
						</View>
					)}
					ListEmptyComponent={
						<View style={styles.empty}>
							<Ionicons name="briefcase-outline" size={40} color={colors.border} />
							<Text style={styles.emptyText}>No active workplaces</Text>
						</View>
					}
				/>
			</SafeAreaView>
		</AnimatedScreen>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	header: {
		paddingHorizontal: spacing['2xl'],
		paddingTop: spacing.lg,
		paddingBottom: spacing.md,
	},
	title: {
		fontSize: fontSize['2xl'],
		fontWeight: '700',
		color: colors.foreground,
		letterSpacing: -0.5,
	},
	statsRow: {
		flexDirection: 'row',
		paddingHorizontal: spacing['2xl'],
		gap: spacing.md,
		marginBottom: spacing.xl,
	},
	statCard: {
		flex: 1,
		backgroundColor: colors.surface,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		padding: spacing.lg,
		alignItems: 'center',
	},
	statValue: {
		fontSize: fontSize.xl,
		fontWeight: '700',
		color: colors.foreground,
	},
	statLabel: {
		fontSize: fontSize.xs,
		color: colors.foregroundSecondary,
		marginTop: 2,
	},
	actionsRow: {
		flexDirection: 'row',
		paddingHorizontal: spacing['2xl'],
		gap: spacing.md,
		marginBottom: spacing['2xl'],
	},
	actionBtn: {
		flex: 1,
		backgroundColor: colors.surface,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		padding: spacing.lg,
		alignItems: 'center',
		gap: spacing.sm,
	},
	actionIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: colors.primaryLight,
		justifyContent: 'center',
		alignItems: 'center',
	},
	actionText: {
		fontSize: fontSize.xs,
		fontWeight: '500',
		color: colors.foreground,
		textAlign: 'center',
	},
	sectionTitle: {
		fontSize: fontSize.base,
		fontWeight: '600',
		color: colors.foreground,
		paddingHorizontal: spacing['2xl'],
		marginBottom: spacing.md,
	},
	list: {
		paddingHorizontal: spacing['2xl'],
		gap: spacing.md,
		paddingBottom: spacing['4xl'],
	},
	businessCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.surface,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.border,
		padding: spacing.lg,
		gap: spacing.md,
	},
	businessIcon: {
		width: 44,
		height: 44,
		borderRadius: 12,
		backgroundColor: colors.primaryLight,
		justifyContent: 'center',
		alignItems: 'center',
	},
	businessInfo: { flex: 1 },
	businessName: {
		fontSize: fontSize.base,
		fontWeight: '600',
		color: colors.foreground,
	},
	businessRole: {
		fontSize: fontSize.sm,
		color: colors.foregroundSecondary,
		marginTop: 2,
	},
	workerBadge: {
		paddingHorizontal: spacing.sm,
		paddingVertical: 3,
		borderRadius: radius.sm,
		backgroundColor: colors.primaryLight,
	},
	workerBadgeText: {
		fontSize: fontSize.xs,
		fontWeight: '500',
		color: colors.primary,
	},
	empty: {
		alignItems: 'center',
		gap: spacing.md,
		paddingVertical: spacing['4xl'],
	},
	emptyText: {
		fontSize: fontSize.base,
		color: colors.foregroundSecondary,
	},
})
