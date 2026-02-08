import { Ionicons } from '@expo/vector-icons'
import { useEffect, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { useAuth } from '../../../lib/auth-context'
import { supabase } from '../../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../../lib/theme'
import type { BusinessHours, Worker, WorkerAvailability, WorkerBlockedDate } from '../../../lib/types'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 11 }, (_, i) => i + 7) // 7am–5pm
const ROW_HEIGHT = 48
const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

function timeToMinutes(time: string): number {
	const [h, m] = time.split(':').map(Number)
	return (h ?? 0) * 60 + (m ?? 0)
}

function formatHour(hour: number): string {
	if (hour === 0) return '12a'
	if (hour < 12) return `${hour}a`
	if (hour === 12) return '12p'
	return `${hour - 12}p`
}

function getWeekDates(offset: number): Date[] {
	const today = new Date()
	const start = new Date(today)
	start.setDate(today.getDate() - today.getDay() + offset * 7)
	return Array.from({ length: 7 }, (_, i) => {
		const d = new Date(start)
		d.setDate(start.getDate() + i)
		return d
	})
}

function formatDate(d: Date): string {
	return d.toISOString().split('T')[0] ?? ''
}

export default function ScheduleScreen() {
	const { user } = useAuth()
	const [loading, setLoading] = useState(true)
	const [businessHours, setBusinessHours] = useState<BusinessHours[]>([])
	const [workers, setWorkers] = useState<Pick<Worker, 'id' | 'display_name' | 'is_active'>[]>([])
	const [availability, setAvailability] = useState<WorkerAvailability[]>([])
	const [blockedDates, setBlockedDates] = useState<WorkerBlockedDate[]>([])
	const [weekOffset, setWeekOffset] = useState(0)
	const [visibleWorkers, setVisibleWorkers] = useState<Set<string>>(new Set())

	const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset])
	const todayStr = formatDate(new Date())

	useEffect(() => {
		if (!user) return
		async function load() {
			const { data: biz } = await supabase
				.from('businesses')
				.select('id')
				.eq('owner_id', user!.id)
				.single()

			if (!biz) { setLoading(false); return }

			const [hoursRes, workersRes, availRes, blockedRes] = await Promise.all([
				supabase.from('business_hours').select('*').eq('business_id', biz.id).order('day_of_week'),
				supabase.from('workers').select('id, display_name, is_active').eq('business_id', biz.id).eq('is_active', true),
				supabase.from('worker_availability').select('*'),
				supabase.from('worker_blocked_dates').select('*'),
			])

			const w = workersRes.data ?? []
			setBusinessHours(hoursRes.data ?? [])
			setWorkers(w)
			setAvailability(availRes.data ?? [])
			setBlockedDates(blockedRes.data ?? [])
			setVisibleWorkers(new Set(w.map((wr) => wr.id)))
			setLoading(false)
		}
		load()
	}, [user])

	function toggleWorker(id: string) {
		setVisibleWorkers((prev) => {
			const next = new Set(prev)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})
	}

	const gridStart = HOURS[0]! * 60
	const gridEnd = (HOURS[HOURS.length - 1]! + 1) * 60
	const visibleWorkersList = workers.filter((w) => visibleWorkers.has(w.id))

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color={colors.primary} />
			</View>
		)
	}

	if (workers.length === 0) {
		return (
			<View style={styles.centered}>
				<Ionicons name="calendar-outline" size={48} color={colors.border} />
				<Text style={styles.emptyTitle}>No workers yet</Text>
				<Text style={styles.emptySubtitle}>Add team members to see their schedule here</Text>
			</View>
		)
	}

	const startDate = weekDates[0]!
	const endDate = weekDates[6]!

	return (
		<View style={styles.container}>
			{/* Week Navigation */}
			<View style={styles.nav}>
				<TouchableOpacity onPress={() => setWeekOffset((p) => p - 1)} style={styles.navBtn}>
					<Ionicons name="chevron-back" size={20} color={colors.foreground} />
				</TouchableOpacity>
				<TouchableOpacity onPress={() => setWeekOffset(0)} style={styles.todayBtn}>
					<Text style={styles.todayBtnText}>Today</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => setWeekOffset((p) => p + 1)} style={styles.navBtn}>
					<Ionicons name="chevron-forward" size={20} color={colors.foreground} />
				</TouchableOpacity>
				<Text style={styles.dateRange}>
					{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
					{' – '}
					{endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
				</Text>
			</View>

			{/* Worker Filter */}
			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
				{workers.map((w, idx) => {
					const active = visibleWorkers.has(w.id)
					const color = CHART_COLORS[idx % CHART_COLORS.length]!
					return (
						<TouchableOpacity
							key={w.id}
							onPress={() => toggleWorker(w.id)}
							style={[styles.filterChip, active && { borderColor: color, backgroundColor: color + '15' }]}
							activeOpacity={0.7}
						>
							<View style={[styles.filterDot, { backgroundColor: active ? color : colors.border }]} />
							<Text style={[styles.filterText, active && { color }]}>{w.display_name.split(' ')[0]}</Text>
						</TouchableOpacity>
					)
				})}
			</ScrollView>

			{/* Schedule Grid */}
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridScroll}>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					<View>
						{/* Day headers */}
						<View style={styles.headerRow}>
							<View style={styles.timeCol} />
							{weekDates.map((date) => {
								const isToday = formatDate(date) === todayStr
								return (
									<View key={formatDate(date)} style={[styles.dayCol, isToday && styles.dayColToday]}>
										<Text style={styles.dayLabel}>{DAYS[date.getDay()]}</Text>
										<Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>{date.getDate()}</Text>
									</View>
								)
							})}
						</View>

						{/* Time rows */}
						{HOURS.map((hour) => (
							<View key={hour} style={styles.row}>
								<View style={styles.timeCol}>
									<Text style={styles.timeLabel}>{formatHour(hour)}</Text>
								</View>
								{weekDates.map((date, dayIdx) => {
									const dayOfWeek = date.getDay()
									const isToday = formatDate(date) === todayStr
									const dateStr = formatDate(date)
									const bh = businessHours.find((h) => h.day_of_week === dayOfWeek)
									const isClosed = !bh || bh.is_closed
									const bizOpen = bh && !bh.is_closed ? timeToMinutes(bh.open_time) : 0
									const bizClose = bh && !bh.is_closed ? timeToMinutes(bh.close_time) : 0
									const hourStart = hour * 60
									const hourEnd = (hour + 1) * 60
									const isInBizHours = !isClosed && hourStart >= bizOpen && hourEnd <= bizClose

									return (
										<View
											key={dayIdx}
											style={[
												styles.cell,
												isToday && styles.cellToday,
												isInBizHours && styles.cellBizHours,
											]}
										>
											{visibleWorkersList.map((worker, wIdx) => {
												const wa = availability.find(
													(a) => a.worker_id === worker.id && a.day_of_week === dayOfWeek && a.is_active
												)
												if (!wa) return null

												const availStart = timeToMinutes(wa.start_time)
												const availEnd = timeToMinutes(wa.end_time)
												const firstHour = Math.floor(availStart / 60)
												if (hour !== firstHour) return null

												const isBlocked = blockedDates.some(
													(b) => b.worker_id === worker.id && b.date === dateStr
												)

												const topPx = ((availStart - gridStart) / (gridEnd - gridStart)) * (HOURS.length * ROW_HEIGHT)
												const heightPx = ((availEnd - availStart) / (gridEnd - gridStart)) * (HOURS.length * ROW_HEIGHT)
												const rowStartPx = ((hour * 60 - gridStart) / (gridEnd - gridStart)) * (HOURS.length * ROW_HEIGHT)
												const color = CHART_COLORS[workers.indexOf(worker) % CHART_COLORS.length]!

												return (
													<View
														key={worker.id}
														style={[
															styles.block,
															{
																top: topPx - rowStartPx,
																height: Math.min(heightPx, 300),
																left: `${(wIdx * 100) / visibleWorkersList.length}%` as unknown as number,
																width: `${100 / visibleWorkersList.length}%` as unknown as number,
																backgroundColor: isBlocked ? '#FEE2E2' : color + '30',
																borderLeftColor: isBlocked ? '#EF4444' : color,
															},
														]}
													>
														{!isBlocked && (
															<Text style={[styles.blockText, { color }]} numberOfLines={1}>
																{worker.display_name.split(' ')[0]}
															</Text>
														)}
														{isBlocked && (
															<Text style={styles.blockedText} numberOfLines={1}>Off</Text>
														)}
													</View>
												)
											})}
										</View>
									)
								})}
							</View>
						))}
					</View>
				</ScrollView>
			</ScrollView>
		</View>
	)
}

const CELL_WIDTH = 52
const TIME_COL_WIDTH = 36

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md, padding: spacing['2xl'] },
	emptyTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.foregroundSecondary },
	emptySubtitle: { fontSize: fontSize.sm, color: colors.foregroundSecondary, textAlign: 'center' },
	nav: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.md,
		gap: spacing.sm,
	},
	navBtn: {
		width: 32,
		height: 32,
		borderRadius: radius.sm,
		borderWidth: 1,
		borderColor: colors.border,
		justifyContent: 'center',
		alignItems: 'center',
	},
	todayBtn: {
		paddingHorizontal: spacing.md,
		height: 32,
		borderRadius: radius.sm,
		borderWidth: 1,
		borderColor: colors.border,
		justifyContent: 'center',
		alignItems: 'center',
	},
	todayBtnText: { fontSize: fontSize.xs, fontWeight: '500', color: colors.foreground },
	dateRange: { fontSize: fontSize.xs, color: colors.foregroundSecondary, marginLeft: 'auto' },
	filters: {
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.md,
		gap: spacing.sm,
	},
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
	filterDot: { width: 8, height: 8, borderRadius: 4 },
	filterText: { fontSize: fontSize.xs, fontWeight: '500', color: colors.foregroundSecondary },
	gridScroll: { paddingBottom: spacing['4xl'] },
	headerRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
	timeCol: { width: TIME_COL_WIDTH, justifyContent: 'flex-start', alignItems: 'flex-end', paddingRight: 4 },
	dayCol: {
		width: CELL_WIDTH,
		alignItems: 'center',
		paddingVertical: spacing.sm,
		borderLeftWidth: 1,
		borderLeftColor: colors.border,
	},
	dayColToday: { backgroundColor: colors.primaryLight },
	dayLabel: { fontSize: 10, fontWeight: '500', color: colors.foregroundSecondary },
	dayNumber: { fontSize: fontSize.sm, fontWeight: '700', color: colors.foreground },
	dayNumberToday: { color: colors.primary },
	row: { flexDirection: 'row', height: ROW_HEIGHT, borderBottomWidth: 1, borderBottomColor: colors.border + '40' },
	timeLabel: { fontSize: 9, color: colors.foregroundSecondary, marginTop: -5 },
	cell: {
		width: CELL_WIDTH,
		borderLeftWidth: 1,
		borderLeftColor: colors.border + '40',
		position: 'relative' as const,
	},
	cellToday: { backgroundColor: colors.primaryLight + '30' },
	cellBizHours: { backgroundColor: colors.surface },
	block: {
		position: 'absolute' as const,
		borderLeftWidth: 2,
		borderRadius: 2,
		paddingHorizontal: 2,
		paddingVertical: 1,
		overflow: 'hidden' as const,
	},
	blockText: { fontSize: 8, fontWeight: '600' },
	blockedText: { fontSize: 8, fontWeight: '600', color: '#EF4444' },
})
