import { AnimatedScreen } from '../../components/animated-screen'
import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	RefreshControl,
	SectionList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../lib/auth-context'
import { formatTime } from '../../lib/booking'
import { supabase } from '../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../lib/theme'

interface BookingItem {
	id: string
	date: string
	start_time: string
	end_time: string
	status: string
	business_id: string
	services: { name: string; price: number } | null
	businesses: { name: string; slug: string } | null
	workers: { display_name: string } | null
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
	pending: { bg: '#FEF3C7', text: '#92400E' },
	confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
	completed: { bg: '#D1FAE5', text: '#065F46' },
	cancelled: { bg: '#FEE2E2', text: '#991B1B' },
	no_show: { bg: '#F3F4F6', text: '#374151' },
}

export default function BookingsScreen() {
	const { user } = useAuth()
	const [bookings, setBookings] = useState<BookingItem[]>([])
	const [loading, setLoading] = useState(true)
	const [refreshing, setRefreshing] = useState(false)

	const fetchBookings = useCallback(async () => {
		if (!user) return
		const { data } = await supabase
			.from('bookings')
			.select('id, date, start_time, end_time, status, business_id, services(name, price), businesses(name, slug), workers(display_name)')
			.eq('client_id', user.id)
			.order('date', { ascending: false })
			.limit(50)
		setBookings((data ?? []) as unknown as BookingItem[])
		setLoading(false)
		setRefreshing(false)
	}, [user])

	useEffect(() => { fetchBookings() }, [fetchBookings])

	const handleCancel = useCallback((bookingId: string) => {
		Alert.alert('Cancel Booking', 'Are you sure you want to cancel?', [
			{ text: 'Keep', style: 'cancel' },
			{
				text: 'Cancel Booking', style: 'destructive', onPress: async () => {
					await supabase.from('bookings').update({ status: 'cancelled', cancelled_by: user!.id }).eq('id', bookingId)
					fetchBookings()
				},
			},
		])
	}, [user, fetchBookings])

	const today = new Date().toISOString().split('T')[0]!
	const upcoming = bookings.filter((b) => b.date >= today && b.status !== 'cancelled')
	const past = bookings.filter((b) => b.date < today || b.status === 'cancelled')

	const sections = [
		...(upcoming.length > 0 ? [{ title: 'Upcoming', data: upcoming }] : []),
		...(past.length > 0 ? [{ title: 'Past', data: past }] : []),
	]

	if (!user) {
		return (
			<AnimatedScreen>
				<SafeAreaView style={styles.container} edges={['top']}>
					<View style={styles.header}><Text style={styles.title}>My Bookings</Text></View>
					<View style={styles.emptyState}>
						<Ionicons name="calendar-outline" size={48} color={colors.border} />
						<Text style={styles.emptyTitle}>Sign in to see your bookings</Text>
						<Link href="/(auth)/login" asChild>
							<TouchableOpacity style={styles.signInBtn} activeOpacity={0.8}>
								<Text style={styles.signInBtnText}>Sign in</Text>
							</TouchableOpacity>
						</Link>
					</View>
				</SafeAreaView>
			</AnimatedScreen>
		)
	}

	return (
		<AnimatedScreen>
			<SafeAreaView style={styles.container} edges={['top']}>
				<View style={styles.header}><Text style={styles.title}>My Bookings</Text></View>
				{loading ? (
					<View style={styles.emptyState}><ActivityIndicator size="large" color={colors.primary} /></View>
				) : sections.length === 0 ? (
					<View style={styles.emptyState}>
						<Ionicons name="calendar-outline" size={48} color={colors.border} />
						<Text style={styles.emptyTitle}>No bookings yet</Text>
						<Text style={styles.emptySubtitle}>Your bookings will appear here</Text>
					</View>
				) : (
					<SectionList
						sections={sections}
						keyExtractor={(item) => item.id}
						renderSectionHeader={({ section }) => (
							<Text style={styles.sectionHeader}>{section.title}</Text>
						)}
						renderItem={({ item }) => {
							const isPast = item.date < today || item.status === 'cancelled'
							const canCancel = (item.status === 'pending' || item.status === 'confirmed') && item.date >= today
							const statusColor = STATUS_COLORS[item.status] ?? { bg: '#F3F4F6', text: '#374151' }
							return (
								<View style={[styles.bookingCard, isPast && styles.bookingCardPast]}>
									<View style={styles.dateBox}>
										<Text style={styles.dateMonth}>{new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}</Text>
										<Text style={styles.dateDay}>{new Date(item.date + 'T00:00:00').getDate()}</Text>
									</View>
									<View style={styles.bookingInfo}>
										<Text style={styles.bookingBusiness}>{item.businesses?.name ?? 'Business'}</Text>
										<Text style={styles.bookingService}>
											{item.services?.name ?? 'Service'}{item.workers?.display_name ? ` with ${item.workers.display_name}` : ''}
										</Text>
										<Text style={styles.bookingTime}>
											{formatTime(item.start_time)} - {formatTime(item.end_time)}
										</Text>
									</View>
									<View style={styles.bookingRight}>
										<View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
											<Text style={[styles.statusText, { color: statusColor.text }]}>{item.status}</Text>
										</View>
										{canCancel && (
											<TouchableOpacity onPress={() => handleCancel(item.id)} activeOpacity={0.7}>
												<Text style={styles.cancelText}>Cancel</Text>
											</TouchableOpacity>
										)}
									</View>
								</View>
							)
						}}
						contentContainerStyle={styles.listContent}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings() }} tintColor={colors.primary} />}
					/>
				)}
			</SafeAreaView>
		</AnimatedScreen>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	header: { paddingHorizontal: spacing['2xl'], paddingTop: spacing.lg, paddingBottom: spacing.xl },
	title: { fontSize: fontSize['2xl'], fontWeight: '700', color: colors.foreground, letterSpacing: -0.5 },
	listContent: { paddingHorizontal: spacing['2xl'], paddingBottom: spacing['3xl'] },
	sectionHeader: { fontSize: fontSize.base, fontWeight: '600', color: colors.foreground, marginTop: spacing.lg, marginBottom: spacing.sm },
	bookingCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.sm },
	bookingCardPast: { opacity: 0.6 },
	dateBox: { width: 44, height: 48, borderRadius: radius.sm, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
	dateMonth: { fontSize: 10, fontWeight: '500', color: colors.primary, textTransform: 'uppercase' },
	dateDay: { fontSize: fontSize.lg, fontWeight: '700', color: colors.primary },
	bookingInfo: { flex: 1 },
	bookingBusiness: { fontSize: fontSize.sm, fontWeight: '600', color: colors.foreground },
	bookingService: { fontSize: fontSize.xs, color: colors.foregroundSecondary, marginTop: 1 },
	bookingTime: { fontSize: fontSize.xs, color: colors.foregroundSecondary, marginTop: 2 },
	bookingRight: { alignItems: 'flex-end', gap: spacing.xs },
	statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
	statusText: { fontSize: 10, fontWeight: '600' },
	cancelText: { fontSize: fontSize.xs, color: colors.destructive, fontWeight: '500' },
	emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md, paddingBottom: 100 },
	emptyTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.foregroundSecondary },
	emptySubtitle: { fontSize: fontSize.sm, color: colors.foregroundSecondary, textAlign: 'center', paddingHorizontal: spacing['4xl'] },
	signInBtn: { marginTop: spacing.md, paddingHorizontal: spacing['2xl'], paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.primary },
	signInBtnText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.white },
})
