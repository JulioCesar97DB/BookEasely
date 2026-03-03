import { AnimatedScreen } from '../../components/animated-screen'
import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { BookingCard, type BookingItem } from '../../components/bookings/booking-card'
import { RescheduleModal } from '../../components/bookings/reschedule-modal'
import { useAuth } from '../../lib/auth-context'
import { cancelBooking, getAvailableSlots, rescheduleBooking, type TimeSlot } from '../../lib/booking'
import { handleSupabaseError } from '../../lib/handle-error'
import { supabase } from '../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../lib/theme'
import { toClientBookings } from '../../lib/types'

export default function BookingsScreen() {
	const { user } = useAuth()
	const [bookings, setBookings] = useState<BookingItem[]>([])
	const [loading, setLoading] = useState(true)
	const [refreshing, setRefreshing] = useState(false)

	// Reschedule state
	const [rescheduleBookingItem, setRescheduleBookingItem] = useState<BookingItem | null>(null)
	const [rescheduleDate, setRescheduleDate] = useState<string | null>(null)
	const [rescheduleSlots, setRescheduleSlots] = useState<TimeSlot[]>([])
	const [rescheduleSelectedSlot, setRescheduleSelectedSlot] = useState<TimeSlot | null>(null)
	const [rescheduleLoadingSlots, setRescheduleLoadingSlots] = useState(false)
	const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false)

	const fetchBookings = useCallback(async () => {
		if (!user) return
		const { data, error } = await supabase
			.from('bookings')
			.select('id, date, start_time, end_time, status, business_id, service_id, worker_id, services(name, price), businesses(name, slug), workers(display_name)')
			.eq('client_id', user.id)
			.order('date', { ascending: false })
			.limit(50)
		handleSupabaseError(error, 'Loading bookings')
		setBookings(toClientBookings(data ?? []))
		setLoading(false)
		setRefreshing(false)
	}, [user])

	useEffect(() => { fetchBookings() }, [fetchBookings])

	const handleCancel = useCallback((bookingId: string) => {
		Alert.alert('Cancel Booking', 'Are you sure you want to cancel?', [
			{ text: 'Keep', style: 'cancel' },
			{
				text: 'Cancel Booking', style: 'destructive', onPress: async () => {
					const result = await cancelBooking({ bookingId })
					if (result.error) {
						Alert.alert('Error', result.error)
					} else {
						fetchBookings()
					}
				},
			},
		])
	}, [fetchBookings])

	// Reschedule date options (next 14 days)
	const dateOptions = useMemo(() => {
		const dates: { label: string; value: string }[] = []
		const now = new Date()
		for (let i = 0; i < 14; i++) {
			const d = new Date(now)
			d.setDate(d.getDate() + i)
			const val = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
			const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
			dates.push({ label, value: val })
		}
		return dates
	}, [])

	const handleRescheduleOpen = useCallback((item: BookingItem) => {
		setRescheduleBookingItem(item)
		setRescheduleDate(null)
		setRescheduleSlots([])
		setRescheduleSelectedSlot(null)
	}, [])

	const handleRescheduleClose = useCallback(() => {
		setRescheduleBookingItem(null)
		setRescheduleDate(null)
		setRescheduleSlots([])
		setRescheduleSelectedSlot(null)
	}, [])

	const handleRescheduleDateSelect = useCallback(async (date: string) => {
		if (!rescheduleBookingItem) return
		setRescheduleDate(date)
		setRescheduleSelectedSlot(null)
		setRescheduleLoadingSlots(true)
		const slots = await getAvailableSlots({
			businessId: rescheduleBookingItem.business_id,
			serviceId: rescheduleBookingItem.service_id,
			workerId: rescheduleBookingItem.worker_id,
			date,
		})
		setRescheduleSlots(slots)
		setRescheduleLoadingSlots(false)
	}, [rescheduleBookingItem])

	const handleRescheduleConfirm = useCallback(async () => {
		if (!rescheduleBookingItem || !rescheduleDate || !rescheduleSelectedSlot) return
		setRescheduleSubmitting(true)
		const result = await rescheduleBooking({
			bookingId: rescheduleBookingItem.id,
			workerId: rescheduleBookingItem.worker_id,
			date: rescheduleDate,
			startTime: rescheduleSelectedSlot.start,
			endTime: rescheduleSelectedSlot.end,
		})
		setRescheduleSubmitting(false)
		if (result.error) {
			Alert.alert('Error', result.error)
		} else {
			handleRescheduleClose()
			fetchBookings()
			Alert.alert('Success', 'Booking rescheduled!')
		}
	}, [rescheduleBookingItem, rescheduleDate, rescheduleSelectedSlot, fetchBookings, handleRescheduleClose])

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
						renderItem={({ item }) => (
							<BookingCard
								item={item}
								today={today}
								onCancel={handleCancel}
								onReschedule={handleRescheduleOpen}
							/>
						)}
						contentContainerStyle={styles.listContent}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings() }} tintColor={colors.primary} />}
					/>
				)}

				<RescheduleModal
					visible={!!rescheduleBookingItem}
					rescheduleBookingItem={rescheduleBookingItem}
					dateOptions={dateOptions}
					rescheduleDate={rescheduleDate}
					rescheduleLoadingSlots={rescheduleLoadingSlots}
					rescheduleSlots={rescheduleSlots}
					rescheduleSelectedSlot={rescheduleSelectedSlot}
					rescheduleSubmitting={rescheduleSubmitting}
					onClose={handleRescheduleClose}
					onDateSelect={handleRescheduleDateSelect}
					onSlotSelect={setRescheduleSelectedSlot}
					onConfirm={handleRescheduleConfirm}
				/>
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
	emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md, paddingBottom: 100 },
	emptyTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.foregroundSecondary },
	emptySubtitle: { fontSize: fontSize.sm, color: colors.foregroundSecondary, textAlign: 'center', paddingHorizontal: spacing['4xl'] },
	signInBtn: { marginTop: spacing.md, paddingHorizontal: spacing['2xl'], paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.primary },
	signInBtnText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.white },
})
