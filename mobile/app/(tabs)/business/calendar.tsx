import Animated, { FadeInDown } from 'react-native-reanimated'
import { AnimatedScreen } from '../../../components/animated-screen'
import { Ionicons } from '@expo/vector-icons'
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
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../../lib/auth-context'
import { supabase } from '../../../lib/supabase'
import { BOOKING_STATUS_COLORS, CHART_COLORS, DAYS_FULL } from '../../../lib/constants'
import { formatTime, formatDateStr } from '../../../lib/format'
import { handleSupabaseError } from '../../../lib/handle-error'
import { colors, fontSize, radius, spacing } from '../../../lib/theme'
import type { BookingStatus, Worker } from '../../../lib/types'

interface CalendarBooking {
	id: string
	date: string
	start_time: string
	end_time: string
	status: BookingStatus
	note: string | null
	worker_id: string
	services: { name: string; price: number } | null
	profiles: { full_name: string; phone: string } | null
	workers: { display_name: string } | null
}

interface RawCalendarBooking {
	id: string
	date: string
	start_time: string
	end_time: string
	status: string
	note: string | null
	worker_id: string
	services: { name: string; price: number }[]
	profiles: { full_name: string; phone: string }[]
	workers: { display_name: string }[]
}

function toCalendarBookings(rows: unknown[]): CalendarBooking[] {
	return (rows as RawCalendarBooking[]).map((r) => ({
		...r,
		status: r.status as BookingStatus,
		services: Array.isArray(r.services) ? r.services[0] ?? null : r.services,
		profiles: Array.isArray(r.profiles) ? r.profiles[0] ?? null : r.profiles,
		workers: Array.isArray(r.workers) ? r.workers[0] ?? null : r.workers,
	}))
}

const STATUS_ORDER: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show']

const STATUS_LABELS: Record<BookingStatus, string> = {
	pending: 'Pending',
	confirmed: 'Confirmed',
	completed: 'Completed',
	cancelled: 'Cancelled',
	no_show: 'No Show',
}

export default function BookingCalendar() {
	const { user } = useAuth()
	const [selectedDate, setSelectedDate] = useState(() => new Date())
	const [bookings, setBookings] = useState<CalendarBooking[]>([])
	const [workers, setWorkers] = useState<Worker[]>([])
	const [businessId, setBusinessId] = useState<string | null>(null)
	const [selectedWorker, setSelectedWorker] = useState<string | null>(null)
	const [selectedStatus, setSelectedStatus] = useState<BookingStatus | null>(null)
	const [loading, setLoading] = useState(true)
	const [actionLoading, setActionLoading] = useState<string | null>(null)

	const dateStr = useMemo(() => formatDateStr(selectedDate), [selectedDate])
	const dayLabel = useMemo(() => {
		const today = formatDateStr(new Date())
		if (dateStr === today) return 'Today'
		const tomorrow = new Date()
		tomorrow.setDate(tomorrow.getDate() + 1)
		if (dateStr === formatDateStr(tomorrow)) return 'Tomorrow'
		return DAYS_FULL[selectedDate.getDay()]
	}, [dateStr, selectedDate])

	const formattedDate = useMemo(() => {
		return selectedDate.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		})
	}, [selectedDate])

	// Load business and workers
	useEffect(() => {
		if (!user) return
		async function loadBusiness() {
			const { data: biz, error } = await supabase
				.from('businesses')
				.select('id')
				.eq('owner_id', user!.id)
				.single()
			if (handleSupabaseError(error, 'Loading business')) return
			if (!biz) return
			setBusinessId(biz.id)

			const { data: w, error: wErr } = await supabase
				.from('workers')
				.select('*')
				.eq('business_id', biz.id)
				.eq('is_active', true)
				.order('display_name')
			if (handleSupabaseError(wErr, 'Loading workers')) return
			setWorkers((w as Worker[]) ?? [])
		}
		loadBusiness()
	}, [user])

	// Load bookings for selected date
	const loadBookings = useCallback(async () => {
		if (!businessId) return
		setLoading(true)
		const { data, error } = await supabase
			.from('bookings')
			.select('id, date, start_time, end_time, status, note, worker_id, services(name, price), profiles:client_id(full_name, phone), workers(display_name)')
			.eq('business_id', businessId)
			.eq('date', dateStr)
			.order('start_time')
		if (handleSupabaseError(error, 'Loading bookings')) {
			setLoading(false)
			return
		}
		setBookings(toCalendarBookings(data ?? []))
		setLoading(false)
	}, [businessId, dateStr])

	useEffect(() => {
		loadBookings()
	}, [loadBookings])

	const filteredBookings = useMemo(() => {
		let result = bookings
		if (selectedWorker) result = result.filter((b) => b.worker_id === selectedWorker)
		if (selectedStatus) result = result.filter((b) => b.status === selectedStatus)
		return result
	}, [bookings, selectedWorker, selectedStatus])

	const statusCounts = useMemo(() => {
		const counts: Record<string, number> = {}
		for (const b of bookings) {
			counts[b.status] = (counts[b.status] ?? 0) + 1
		}
		return counts
	}, [bookings])

	const workerColorMap = useMemo(() => {
		const map: Record<string, string> = {}
		workers.forEach((w, i) => {
			map[w.id] = CHART_COLORS[i % CHART_COLORS.length]!
		})
		return map
	}, [workers])

	function navigateDay(offset: number) {
		setSelectedDate((prev) => {
			const d = new Date(prev)
			d.setDate(d.getDate() + offset)
			return d
		})
	}

	function goToToday() {
		setSelectedDate(new Date())
	}

	async function updateStatus(bookingId: string, newStatus: BookingStatus) {
		setActionLoading(bookingId)
		const { error } = await supabase
			.from('bookings')
			.update({ status: newStatus, updated_at: new Date().toISOString() })
			.eq('id', bookingId)
		setActionLoading(null)
		if (handleSupabaseError(error, 'Updating booking')) return
		loadBookings()
	}

	function handleConfirm(bookingId: string) {
		updateStatus(bookingId, 'confirmed')
	}

	function handleComplete(bookingId: string) {
		updateStatus(bookingId, 'completed')
	}

	function handleCancel(bookingId: string) {
		Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
			{ text: 'No', style: 'cancel' },
			{
				text: 'Yes, Cancel',
				style: 'destructive',
				onPress: () => updateStatus(bookingId, 'cancelled'),
			},
		])
	}

	function handleNoShow(bookingId: string) {
		updateStatus(bookingId, 'no_show')
	}

	const renderBookingItem = useCallback(
		({ item, index }: { item: CalendarBooking; index: number }) => {
			const statusStyle = BOOKING_STATUS_COLORS[item.status]
			const workerColor = workerColorMap[item.worker_id] ?? colors.primary
			const isActioning = actionLoading === item.id

			return (
				<Animated.View entering={FadeInDown.delay(index * 50).duration(200)}>
					<View style={styles.bookingCard}>
						{/* Time + Status */}
						<View style={styles.bookingHeader}>
							<View style={styles.timeBlock}>
								<Text style={styles.timeText}>
									{formatTime(item.start_time)} – {formatTime(item.end_time)}
								</Text>
							</View>
							<View style={[styles.statusBadge, { backgroundColor: statusStyle?.bg ?? colors.mutedLight }]}>
								<View style={[styles.statusDot, { backgroundColor: statusStyle?.text ?? colors.muted }]} />
								<Text style={[styles.statusText, { color: statusStyle?.text ?? colors.muted }]}>
									{STATUS_LABELS[item.status]}
								</Text>
							</View>
						</View>

						{/* Client + Service */}
						<View style={styles.bookingBody}>
							<View style={styles.infoRow}>
								<Ionicons name="person-outline" size={14} color={colors.foregroundSecondary} />
								<Text style={styles.infoText}>
									{item.profiles?.full_name ?? 'Unknown client'}
								</Text>
							</View>
							<View style={styles.infoRow}>
								<Ionicons name="cut-outline" size={14} color={colors.foregroundSecondary} />
								<Text style={styles.infoText}>
									{item.services?.name ?? 'Unknown service'}
									{item.services?.price != null && (
										<Text style={styles.priceText}> · ${item.services.price}</Text>
									)}
								</Text>
							</View>
							<View style={styles.infoRow}>
								<View style={[styles.workerDot, { backgroundColor: workerColor }]} />
								<Text style={styles.infoText}>
									{item.workers?.display_name ?? 'Unknown worker'}
								</Text>
							</View>
							{item.note && (
								<View style={styles.infoRow}>
									<Ionicons
										name="chatbubble-outline"
										size={14}
										color={colors.foregroundSecondary}
									/>
									<Text style={styles.noteText} numberOfLines={2}>
										{item.note}
									</Text>
								</View>
							)}
						</View>

						{/* Actions */}
						{(item.status === 'pending' || item.status === 'confirmed') && (
							<View style={styles.actionRow}>
								{isActioning ? (
									<ActivityIndicator size="small" color={colors.primary} />
								) : (
									<>
										{item.status === 'pending' && (
											<TouchableOpacity
												style={[styles.actionBtn, { backgroundColor: colors.success + '15' }]}
												onPress={() => handleConfirm(item.id)}
											>
												<Ionicons name="checkmark" size={16} color={colors.success} />
												<Text style={[styles.actionText, { color: colors.success }]}>
													Confirm
												</Text>
											</TouchableOpacity>
										)}
										{item.status === 'confirmed' && (
											<TouchableOpacity
												style={[styles.actionBtn, { backgroundColor: colors.primary + '15' }]}
												onPress={() => handleComplete(item.id)}
											>
												<Ionicons name="checkmark-done" size={16} color={colors.primary} />
												<Text style={[styles.actionText, { color: colors.primary }]}>
													Complete
												</Text>
											</TouchableOpacity>
										)}
										{item.status === 'confirmed' && (
											<TouchableOpacity
												style={[styles.actionBtn, { backgroundColor: colors.warning + '15' }]}
												onPress={() => handleNoShow(item.id)}
											>
												<Ionicons name="alert-outline" size={16} color={colors.warning} />
												<Text style={[styles.actionText, { color: colors.warning }]}>
													No Show
												</Text>
											</TouchableOpacity>
										)}
										<TouchableOpacity
											style={[styles.actionBtn, { backgroundColor: colors.danger + '15' }]}
											onPress={() => handleCancel(item.id)}
										>
											<Ionicons name="close" size={16} color={colors.danger} />
											<Text style={[styles.actionText, { color: colors.danger }]}>Cancel</Text>
										</TouchableOpacity>
									</>
								)}
							</View>
						)}
					</View>
				</Animated.View>
			)
		},
		[actionLoading, workerColorMap]
	)

	if (!businessId && !loading) {
		return (
			<SafeAreaView style={styles.container} edges={['top']}>
				<View style={styles.centered}>
					<Ionicons name="calendar-outline" size={48} color={colors.border} />
					<Text style={styles.emptyTitle}>No business found</Text>
				</View>
			</SafeAreaView>
		)
	}

	return (
		<AnimatedScreen>
			<View style={styles.container}>
				{/* Date Navigator */}
				<Animated.View entering={FadeInDown.delay(50).duration(200)} style={styles.dateNav}>
					<TouchableOpacity onPress={() => navigateDay(-1)} style={styles.navBtn}>
						<Ionicons name="chevron-back" size={22} color={colors.foreground} />
					</TouchableOpacity>
					<TouchableOpacity onPress={goToToday} style={styles.dateCenter}>
						<Text style={styles.dayLabel}>{dayLabel}</Text>
						<Text style={styles.dateText}>{formattedDate}</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => navigateDay(1)} style={styles.navBtn}>
						<Ionicons name="chevron-forward" size={22} color={colors.foreground} />
					</TouchableOpacity>
				</Animated.View>

				{/* Worker Filter */}
				{workers.length > 1 && (
					<Animated.View entering={FadeInDown.delay(100).duration(200)}>
						<FlatList
							horizontal
							showsHorizontalScrollIndicator={false}
							data={[{ id: null, display_name: 'All' } as { id: string | null; display_name: string }, ...workers]}
							keyExtractor={(item) => item.id ?? 'all'}
							contentContainerStyle={styles.filterRow}
							renderItem={({ item, index }) => {
								const isActive = selectedWorker === item.id
								const chipColor = item.id ? workerColorMap[item.id] ?? colors.primary : colors.primary
								return (
									<TouchableOpacity
										onPress={() => setSelectedWorker(item.id)}
										style={[
											styles.filterChip,
											isActive && { backgroundColor: chipColor + '20', borderColor: chipColor },
										]}
									>
										{item.id && (
											<View style={[styles.workerDot, { backgroundColor: chipColor }]} />
										)}
										<Text
											style={[
												styles.filterChipText,
												isActive && { color: chipColor, fontWeight: '600' },
											]}
										>
											{item.display_name}
										</Text>
									</TouchableOpacity>
								)
							}}
						/>
					</Animated.View>
				)}

				{/* Status Filter */}
				<Animated.View entering={FadeInDown.delay(150).duration(200)}>
					<FlatList
						horizontal
						showsHorizontalScrollIndicator={false}
						data={[null, ...STATUS_ORDER]}
						keyExtractor={(item) => item ?? 'all'}
						contentContainerStyle={styles.filterRow}
						renderItem={({ item }) => {
							const isActive = selectedStatus === item
							const label = item ? STATUS_LABELS[item] : 'All'
							const count = item ? statusCounts[item] ?? 0 : bookings.length
							const statusStyle = item ? BOOKING_STATUS_COLORS[item] : null
							const chipColor = statusStyle?.text ?? colors.primary
							return (
								<TouchableOpacity
									onPress={() => setSelectedStatus(item)}
									style={[
										styles.filterChip,
										isActive && { backgroundColor: statusStyle?.bg ?? colors.primaryLight, borderColor: chipColor },
									]}
								>
									<Text
										style={[
											styles.filterChipText,
											isActive && { color: chipColor, fontWeight: '600' },
										]}
									>
										{label} ({count})
									</Text>
								</TouchableOpacity>
							)
						}}
					/>
				</Animated.View>

				{/* Bookings List */}
				{loading ? (
					<View style={styles.centered}>
						<ActivityIndicator size="large" color={colors.primary} />
					</View>
				) : filteredBookings.length === 0 ? (
					<View style={styles.centered}>
						<Ionicons name="calendar-outline" size={48} color={colors.border} />
						<Text style={styles.emptyTitle}>No bookings</Text>
						<Text style={styles.emptySubtitle}>
							{selectedWorker || selectedStatus
								? 'Try changing filters'
								: `No bookings for ${formattedDate}`}
						</Text>
					</View>
				) : (
					<FlatList
						data={filteredBookings}
						keyExtractor={(item) => item.id}
						renderItem={renderBookingItem}
						contentContainerStyle={styles.listContent}
						showsVerticalScrollIndicator={false}
					/>
				)}
			</View>
		</AnimatedScreen>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
	dateNav: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.md,
		backgroundColor: colors.surface,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	navBtn: {
		width: 40,
		height: 40,
		borderRadius: radius.full,
		justifyContent: 'center',
		alignItems: 'center',
	},
	dateCenter: { alignItems: 'center' },
	dayLabel: { fontSize: fontSize.lg, fontWeight: '700', color: colors.foreground },
	dateText: { fontSize: fontSize.sm, color: colors.foregroundSecondary, marginTop: 2 },
	filterRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
	filterChip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: spacing.md,
		paddingVertical: 6,
		borderRadius: radius.full,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.surface,
	},
	filterChipText: { fontSize: fontSize.sm, color: colors.foregroundSecondary },
	workerDot: { width: 8, height: 8, borderRadius: 4 },
	listContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing['4xl'] },
	bookingCard: {
		backgroundColor: colors.surface,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.border,
		overflow: 'hidden',
	},
	bookingHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.md,
		paddingBottom: spacing.sm,
	},
	timeBlock: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
	timeText: { fontSize: fontSize.base, fontWeight: '600', color: colors.foreground },
	statusBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: spacing.sm,
		paddingVertical: 3,
		borderRadius: radius.full,
	},
	statusDot: { width: 6, height: 6, borderRadius: 3 },
	statusText: { fontSize: fontSize.xs, fontWeight: '600' },
	bookingBody: {
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.md,
		gap: 6,
	},
	infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
	infoText: { fontSize: fontSize.sm, color: colors.foreground, flex: 1 },
	priceText: { color: colors.foregroundSecondary },
	noteText: { fontSize: fontSize.sm, color: colors.foregroundSecondary, flex: 1, fontStyle: 'italic' },
	actionRow: {
		flexDirection: 'row',
		gap: spacing.sm,
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.sm,
		borderTopWidth: 1,
		borderTopColor: colors.border,
		backgroundColor: colors.background,
	},
	actionBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: spacing.md,
		paddingVertical: 6,
		borderRadius: radius.sm,
	},
	actionText: { fontSize: fontSize.xs, fontWeight: '600' },
	emptyTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.foregroundSecondary },
	emptySubtitle: {
		fontSize: fontSize.sm,
		color: colors.foregroundSecondary,
		textAlign: 'center',
		paddingHorizontal: spacing['4xl'],
	},
})
