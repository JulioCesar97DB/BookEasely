import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../../lib/auth-context'
import { supabase } from '../../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../../lib/theme'
import type { Business } from '../../../lib/types'

interface QuickAction {
	label: string
	icon: keyof typeof Ionicons.glyphMap
	route: string
	color: string
}

const actions: QuickAction[] = [
	{ label: 'Edit Profile', icon: 'storefront-outline', route: '/(tabs)/business/profile', color: colors.primary },
	{ label: 'Services', icon: 'clipboard-outline', route: '/(tabs)/business/services', color: '#30A46C' },
	{ label: 'Team', icon: 'people-outline', route: '/(tabs)/business/workers', color: '#E5484D' },
	{ label: 'Hours', icon: 'time-outline', route: '/(tabs)/business/hours', color: '#F76B15' },
	{ label: 'Settings', icon: 'settings-outline', route: '/(tabs)/business/settings', color: '#6E56CF' },
]

export default function BusinessDashboard() {
	const { user } = useAuth()
	const router = useRouter()
	const [business, setBusiness] = useState<Business | null>(null)
	const [stats, setStats] = useState({ services: 0, workers: 0 })
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!user) return

		async function load() {
			const { data: biz } = await supabase
				.from('businesses')
				.select('*')
				.eq('owner_id', user!.id)
				.single()

			if (biz) {
				setBusiness(biz)

				const [servicesRes, workersRes] = await Promise.all([
					supabase.from('services').select('id', { count: 'exact', head: true }).eq('business_id', biz.id),
					supabase.from('workers').select('id', { count: 'exact', head: true }).eq('business_id', biz.id),
				])

				setStats({
					services: servicesRes.count ?? 0,
					workers: workersRes.count ?? 0,
				})
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

	if (!business) {
		return (
			<SafeAreaView style={styles.container} edges={['top']}>
				<View style={styles.centered}>
					<Ionicons name="storefront-outline" size={48} color={colors.border} />
					<Text style={styles.emptyTitle}>No business found</Text>
					<Text style={styles.emptySubtitle}>Complete onboarding to set up your business</Text>
				</View>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={styles.container} edges={['top']}>
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
				<View style={styles.header}>
					<Text style={styles.title}>My Business</Text>
				</View>

				{/* Business Card */}
				<View style={styles.businessCard}>
					<View style={styles.businessIcon}>
						<Ionicons name="storefront" size={24} color={colors.white} />
					</View>
					<View style={styles.businessInfo}>
						<Text style={styles.businessName}>{business.name}</Text>
						{business.city && business.state && (
							<Text style={styles.businessLocation}>
								{business.city}, {business.state}
							</Text>
						)}
					</View>
					{business.rating_count > 0 && (
						<View style={styles.ratingBadge}>
							<Ionicons name="star" size={14} color="#F59E0B" />
							<Text style={styles.ratingText}>{business.rating_avg.toFixed(1)}</Text>
						</View>
					)}
				</View>

				{/* Stats */}
				<View style={styles.statsRow}>
					<View style={styles.statCard}>
						<Text style={styles.statNumber}>{stats.services}</Text>
						<Text style={styles.statLabel}>Services</Text>
					</View>
					<View style={styles.statCard}>
						<Text style={styles.statNumber}>{stats.workers}</Text>
						<Text style={styles.statLabel}>Workers</Text>
					</View>
					<View style={styles.statCard}>
						<Text style={styles.statNumber}>{business.rating_count}</Text>
						<Text style={styles.statLabel}>Reviews</Text>
					</View>
				</View>

				{/* Quick Actions */}
				<Text style={styles.sectionTitle}>Quick Actions</Text>
				<View style={styles.actionsGrid}>
					{actions.map((action) => (
						<TouchableOpacity
							key={action.route}
							style={styles.actionCard}
							activeOpacity={0.7}
							onPress={() => router.push(action.route as never)}
						>
							<View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
								<Ionicons name={action.icon} size={22} color={action.color} />
							</View>
							<Text style={styles.actionLabel}>{action.label}</Text>
							<Ionicons name="chevron-forward" size={16} color={colors.foregroundSecondary} />
						</TouchableOpacity>
					))}
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
	scroll: { paddingBottom: spacing['4xl'] },
	header: {
		paddingHorizontal: spacing['2xl'],
		paddingTop: spacing.lg,
		paddingBottom: spacing.xl,
	},
	title: {
		fontSize: fontSize['2xl'],
		fontWeight: '700',
		color: colors.foreground,
		letterSpacing: -0.5,
	},
	emptyTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.foregroundSecondary },
	emptySubtitle: { fontSize: fontSize.sm, color: colors.foregroundSecondary, textAlign: 'center', paddingHorizontal: spacing['4xl'] },
	businessCard: {
		flexDirection: 'row',
		alignItems: 'center',
		marginHorizontal: spacing['2xl'],
		padding: spacing.lg,
		backgroundColor: colors.surface,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.border,
		gap: spacing.md,
	},
	businessIcon: {
		width: 48,
		height: 48,
		borderRadius: radius.md,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
	businessInfo: { flex: 1 },
	businessName: { fontSize: fontSize.lg, fontWeight: '700', color: colors.foreground },
	businessLocation: { fontSize: fontSize.sm, color: colors.foregroundSecondary, marginTop: 2 },
	ratingBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		backgroundColor: '#FEF3C7',
		paddingHorizontal: spacing.sm,
		paddingVertical: 4,
		borderRadius: radius.full,
	},
	ratingText: { fontSize: fontSize.sm, fontWeight: '600', color: '#92400E' },
	statsRow: {
		flexDirection: 'row',
		gap: spacing.md,
		marginHorizontal: spacing['2xl'],
		marginTop: spacing.xl,
	},
	statCard: {
		flex: 1,
		alignItems: 'center',
		padding: spacing.lg,
		backgroundColor: colors.surface,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
	},
	statNumber: { fontSize: fontSize.xl, fontWeight: '700', color: colors.foreground },
	statLabel: { fontSize: fontSize.xs, color: colors.foregroundSecondary, marginTop: 2 },
	sectionTitle: {
		fontSize: fontSize.lg,
		fontWeight: '600',
		color: colors.foreground,
		marginHorizontal: spacing['2xl'],
		marginTop: spacing['2xl'],
		marginBottom: spacing.md,
	},
	actionsGrid: {
		marginHorizontal: spacing['2xl'],
		gap: spacing.sm,
	},
	actionCard: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: spacing.lg,
		backgroundColor: colors.surface,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		gap: spacing.md,
	},
	actionIcon: {
		width: 40,
		height: 40,
		borderRadius: radius.sm,
		justifyContent: 'center',
		alignItems: 'center',
	},
	actionLabel: {
		flex: 1,
		fontSize: fontSize.base,
		fontWeight: '500',
		color: colors.foreground,
	},
})
