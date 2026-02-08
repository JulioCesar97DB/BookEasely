import { Ionicons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	SectionList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { useAuth } from '../../../lib/auth-context'
import { supabase } from '../../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../../lib/theme'

interface BookingItem {
	id: string
	date: string
	start_time: string
	end_time: string
	status: string
	note: string | null
	services: { name: string; duration_minutes: number; price: number } | null
	profiles: { full_name: string } | null
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
	pending: { bg: '#FEF3C7', text: '#92400E' },
	confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
	completed: { bg: '#D1FAE5', text: '#065F46' },
	cancelled: { bg: '#FEE2E2', text: '#991B1B' },
	no_show: { bg: '#F3F4F6', text: '#374151' },
}

export default function AppointmentsScreen() {
	const { user } = useAuth()
	const [loading, setLoading] = useState(true)
	const [bookings, setBookings] = useState<BookingItem[]>([])
	const [updating, setUpdating] = useState<string | null>(null)

	useEffect(() => {
		if (!user) return
		loadBookings()
	}, [user])

	async function loadBookings() {
		const { data: workerRecords } = await supabase
			.from('workers')
			.select('id')
			.eq('user_id', user!.id)
			.eq('is_active', true)

		const workerIds = workerRecords?.map((w) => w.id) ?? []
		if (workerIds.length === 0) {
			setLoading(false)
			return
		}

		const { data } = await supabase
			.from('bookings')
			.select('id, date, start_time, end_time, status, note, services(name, duration_minutes, price), profiles!bookings_client_id_fkey(full_name)')
			.in('worker_id', workerIds)
			.order('date', { ascending: true })
			.order('start_time', { ascending: true })
			.limit(100)

		setBookings((data ?? []) as unknown as BookingItem[])
		setLoading(false)
	}

	async function handleUpdateStatus(bookingId: string, newStatus: string) {
		setUpdating(bookingId)
		const { error } = await supabase
			.from('bookings')
			.update({ status: newStatus, updated_at: new Date().toISOString() })
			.eq('id', bookingId)

		setUpdating(null)
		if (error) {
			Alert.alert('Error', error.message)
		} else {
			setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: newStatus } : b))
		}
	}

	const today = new Date().toISOString().split('T')[0]!

	const todayBookings = bookings.filter((b) => b.date === today && !['cancelled', 'no_show'].includes(b.status))
	const upcomingBookings = bookings.filter((b) => b.date > today && !['cancelled', 'no_show'].includes(b.status))
	const pastBookings = bookings.filter((b) => b.date < today || ['cancelled', 'no_show', 'completed'].includes(b.status))
		.filter((b) => b.date !== today || ['cancelled', 'no_show', 'completed'].includes(b.status))

	const sections = [
		{ title: 'Today', data: todayBookings },
		{ title: 'Upcoming', data: upcomingBookings },
		{ title: 'Past', data: pastBookings },
	].filter((s) => s.data.length > 0)

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color={colors.primary} />
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<SectionList
				sections={sections}
				keyExtractor={(item) => item.id}
				contentContainerStyle={bookings.length === 0 ? styles.emptyContainer : styles.list}
				renderSectionHeader={({ section }) => (
					<Text style={styles.sectionHeader}>{section.title}</Text>
				)}
				renderItem={({ item }) => {
					const isPast = item.date < today || ['completed', 'cancelled', 'no_show'].includes(item.status)
					const canConfirm = item.status === 'pending'
					const canComplete = item.status === 'confirmed'
					const statusColor = STATUS_COLORS[item.status] ?? STATUS_COLORS.pending!

					return (
						<View style={[styles.card, isPast && styles.cardPast]}>
							<View style={styles.dateCol}>
								<Text style={styles.dateMonth}>
									{new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
								</Text>
								<Text style={styles.dateDay}>
									{new Date(item.date + 'T00:00:00').getDate()}
								</Text>
							</View>
							<View style={styles.cardContent}>
								<Text style={styles.clientName}>{item.profiles?.full_name ?? 'Client'}</Text>
								<Text style={styles.serviceName}>{item.services?.name ?? 'Service'}</Text>
								<View style={styles.timeRow}>
									<Ionicons name="time-outline" size={12} color={colors.foregroundSecondary} />
									<Text style={styles.timeText}>
										{item.start_time.slice(0, 5)} – {item.end_time.slice(0, 5)}
									</Text>
								</View>
							</View>
							<View style={styles.cardRight}>
								<View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
									<Text style={[styles.statusText, { color: statusColor.text }]}>{item.status}</Text>
								</View>
								{(canConfirm || canComplete) && (
									<TouchableOpacity
										style={styles.actionBtn}
										onPress={() => handleUpdateStatus(item.id, canConfirm ? 'confirmed' : 'completed')}
										disabled={updating === item.id}
										activeOpacity={0.7}
									>
										{updating === item.id ? (
											<ActivityIndicator size="small" color={colors.primary} />
										) : (
											<Text style={styles.actionBtnText}>
												{canConfirm ? 'Confirm' : 'Complete'}
											</Text>
										)}
									</TouchableOpacity>
								)}
							</View>
						</View>
					)
				}}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<Ionicons name="clipboard-outline" size={48} color={colors.border} />
						<Text style={styles.emptyTitle}>No appointments</Text>
						<Text style={styles.emptySubtitle}>
							Appointments assigned to you will appear here
						</Text>
					</View>
				}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	list: { padding: spacing['2xl'], paddingBottom: spacing['5xl'] },
	emptyContainer: { flex: 1, padding: spacing['2xl'] },
	sectionHeader: {
		fontSize: fontSize.base,
		fontWeight: '600',
		color: colors.foreground,
		marginBottom: spacing.md,
		marginTop: spacing.lg,
	},
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.surface,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		padding: spacing.lg,
		marginBottom: spacing.md,
		gap: spacing.md,
	},
	cardPast: { opacity: 0.6 },
	dateCol: {
		width: 44,
		height: 48,
		borderRadius: radius.sm,
		backgroundColor: colors.primaryLight,
		justifyContent: 'center',
		alignItems: 'center',
	},
	dateMonth: {
		fontSize: 10,
		fontWeight: '500',
		color: colors.primary,
		textTransform: 'uppercase',
	},
	dateDay: {
		fontSize: fontSize.lg,
		fontWeight: '700',
		color: colors.primary,
		lineHeight: 20,
	},
	cardContent: { flex: 1, gap: 2 },
	clientName: {
		fontSize: fontSize.base,
		fontWeight: '600',
		color: colors.foreground,
	},
	serviceName: {
		fontSize: fontSize.sm,
		color: colors.foregroundSecondary,
	},
	timeRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		marginTop: 2,
	},
	timeText: {
		fontSize: fontSize.xs,
		color: colors.foregroundSecondary,
	},
	cardRight: {
		alignItems: 'flex-end',
		gap: spacing.sm,
	},
	statusBadge: {
		paddingHorizontal: spacing.sm,
		paddingVertical: 2,
		borderRadius: radius.sm,
	},
	statusText: {
		fontSize: fontSize.xs,
		fontWeight: '500',
	},
	actionBtn: {
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.xs,
		borderRadius: radius.sm,
		borderWidth: 1,
		borderColor: colors.primary,
	},
	actionBtnText: {
		fontSize: fontSize.xs,
		fontWeight: '600',
		color: colors.primary,
	},
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
})
