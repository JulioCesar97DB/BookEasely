import { AnimatedScreen } from '../../components/animated-screen'
import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Modal,
	RefreshControl,
	ScrollView,
	SectionList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../lib/auth-context'
import { formatTime, getAvailableSlots, rescheduleBooking, type TimeSlot } from '../../lib/booking'
import { supabase } from '../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../lib/theme'

interface BookingItem {
	id: string
	date: string
	start_time: string
	end_time: string
	status: string
	business_id: string
	service_id: string
	worker_id: string
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

	// Reschedule state
	const [rescheduleBookingItem, setRescheduleBookingItem] = useState<BookingItem | null>(null)
	const [rescheduleDate, setRescheduleDate] = useState<string | null>(null)
	const [rescheduleSlots, setRescheduleSlots] = useState<TimeSlot[]>([])
	const [rescheduleSelectedSlot, setRescheduleSelectedSlot] = useState<TimeSlot | null>(null)
	const [rescheduleLoadingSlots, setRescheduleLoadingSlots] = useState(false)
	const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false)

	const fetchBookings = useCallback(async () => {
		if (!user) return
		const { data } = await supabase
			.from('bookings')
			.select('id, date, start_time, end_time, status, business_id, service_id, worker_id, services(name, price), businesses(name, slug), workers(display_name)')
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
						renderItem={({ item }) => {
							const isPast = item.date < today || item.status === 'cancelled'
							const canCancel = (item.status === 'pending' || item.status === 'confirmed') && item.date >= today
							const canReschedule = (item.status === 'pending' || item.status === 'confirmed') && item.date >= today
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
										{canReschedule && (
											<TouchableOpacity onPress={() => handleRescheduleOpen(item)} activeOpacity={0.7}>
												<Text style={styles.rescheduleText}>Reschedule</Text>
											</TouchableOpacity>
										)}
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

				{/* Reschedule Modal */}
				<Modal visible={!!rescheduleBookingItem} animationType="slide" transparent>
					<View style={styles.modalOverlay}>
						<View style={styles.modalContent}>
							<View style={styles.modalHeader}>
								<Text style={styles.modalTitle}>Reschedule Booking</Text>
								<TouchableOpacity onPress={handleRescheduleClose} activeOpacity={0.7}>
									<Ionicons name="close" size={24} color={colors.foreground} />
								</TouchableOpacity>
							</View>
							<Text style={styles.modalSubtitle}>Pick a new date and time</Text>

							{/* Date chips */}
							<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateChips}>
								{dateOptions.map((d) => (
									<TouchableOpacity
										key={d.value}
										style={[styles.dateChip, rescheduleDate === d.value && styles.dateChipActive]}
										onPress={() => handleRescheduleDateSelect(d.value)}
										activeOpacity={0.7}
									>
										<Text style={[styles.dateChipText, rescheduleDate === d.value && styles.dateChipTextActive]}>{d.label}</Text>
									</TouchableOpacity>
								))}
							</ScrollView>

							{/* Time slots */}
							<ScrollView style={styles.slotsScroll} contentContainerStyle={styles.slotsScrollContent}>
								{!rescheduleDate && (
									<View style={styles.placeholderBox}>
										<Ionicons name="calendar-outline" size={28} color={colors.border} />
										<Text style={styles.placeholderText}>Select a date to see times</Text>
									</View>
								)}
								{rescheduleDate && rescheduleLoadingSlots && (
									<View style={styles.placeholderBox}>
										<ActivityIndicator size="small" color={colors.primary} />
										<Text style={styles.placeholderText}>Loading times...</Text>
									</View>
								)}
								{rescheduleDate && !rescheduleLoadingSlots && rescheduleSlots.length === 0 && (
									<View style={styles.placeholderBox}>
										<Ionicons name="time-outline" size={28} color={colors.border} />
										<Text style={styles.placeholderText}>No available times</Text>
									</View>
								)}
								{rescheduleDate && !rescheduleLoadingSlots && rescheduleSlots.length > 0 && (
									<View style={styles.slotsGrid}>
										{rescheduleSlots.map((slot) => (
											<TouchableOpacity
												key={slot.start}
												style={[styles.slotChip, rescheduleSelectedSlot?.start === slot.start && styles.slotChipActive]}
												onPress={() => setRescheduleSelectedSlot(slot)}
												activeOpacity={0.7}
											>
												<Text style={[styles.slotChipText, rescheduleSelectedSlot?.start === slot.start && styles.slotChipTextActive]}>
													{formatTime(slot.start)}
												</Text>
											</TouchableOpacity>
										))}
									</View>
								)}
							</ScrollView>

							{/* Confirm button */}
							<TouchableOpacity
								style={[styles.confirmBtn, (!rescheduleSelectedSlot || rescheduleSubmitting) && styles.confirmBtnDisabled]}
								onPress={handleRescheduleConfirm}
								disabled={!rescheduleSelectedSlot || rescheduleSubmitting}
								activeOpacity={0.8}
							>
								{rescheduleSubmitting ? (
									<ActivityIndicator size="small" color={colors.white} />
								) : (
									<Text style={styles.confirmBtnText}>Confirm New Time</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
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
	rescheduleText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '500' },
	cancelText: { fontSize: fontSize.xs, color: colors.destructive, fontWeight: '500' },
	emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md, paddingBottom: 100 },
	emptyTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.foregroundSecondary },
	emptySubtitle: { fontSize: fontSize.sm, color: colors.foregroundSecondary, textAlign: 'center', paddingHorizontal: spacing['4xl'] },
	signInBtn: { marginTop: spacing.md, paddingHorizontal: spacing['2xl'], paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.primary },
	signInBtnText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.white },
	// Reschedule modal styles
	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
	modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: spacing['2xl'], paddingTop: spacing.lg, paddingBottom: spacing['5xl'], maxHeight: '80%' },
	modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
	modalTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.foreground },
	modalSubtitle: { fontSize: fontSize.sm, color: colors.foregroundSecondary, marginBottom: spacing.lg },
	dateChips: { gap: spacing.sm, paddingVertical: spacing.sm },
	dateChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
	dateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
	dateChipText: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foreground },
	dateChipTextActive: { color: colors.white },
	slotsScroll: { maxHeight: 220, marginTop: spacing.md },
	slotsScrollContent: { paddingBottom: spacing.md },
	placeholderBox: { alignItems: 'center', paddingVertical: spacing['3xl'], gap: spacing.sm },
	placeholderText: { fontSize: fontSize.sm, color: colors.foregroundSecondary },
	slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
	slotChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
	slotChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
	slotChipText: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foreground },
	slotChipTextActive: { color: colors.white },
	confirmBtn: { backgroundColor: colors.primary, height: 48, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', marginTop: spacing.lg },
	confirmBtnDisabled: { opacity: 0.5 },
	confirmBtnText: { fontSize: fontSize.base, fontWeight: '600', color: colors.white },
})
