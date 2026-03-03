import { Ionicons } from '@expo/vector-icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { useAuth } from '../../../lib/auth-context'
import { CHART_COLORS, DAYS_SHORT } from '../../../lib/constants'
import { formatDateStr, timeToMinutes } from '../../../lib/format'
import { supabase } from '../../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../../lib/theme'
import type { BusinessHours, Worker, WorkerAvailability, WorkerBlockedDate } from '../../../lib/types'

const HOURS = Array.from({ length: 11 }, (_, i) => i + 7) // 7am–5pm
const ROW_HEIGHT = 48

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
	const todayStr = useMemo(() => formatDateStr(new Date()), [])

	useEffect(() => {
		if (!user) return
		async function load() {
			const { data: biz } = await supabase
				.from('businesses')
				.select('id')
				.eq('owner_id', user!.id)
				.single()

			if (!biz) { setLoading(false); return }

			const [hoursRes, workersRes] = await Promise.all([
				supabase.from('business_hours').select('*').eq('business_id', biz.id).order('day_of_week'),
				supabase.from('workers').select('id, display_name, is_active').eq('business_id', biz.id).eq('is_active', true),
			])

			const w = workersRes.data ?? []
			const workerIds = w.map((wr) => wr.id)

			let availData: WorkerAvailability[] = []
			let blockedData: WorkerBlockedDate[] = []

			if (workerIds.length > 0) {
				const [availRes, blockedRes] = await Promise.all([
					supabase.from('worker_availability').select('*').in('worker_id', workerIds),
					supabase.from('worker_blocked_dates').select('*').in('worker_id', workerIds),
				])
				availData = availRes.data ?? []
				blockedData = blockedRes.data ?? []
			}

			setBusinessHours(hoursRes.data ?? [])
			setWorkers(w)
			setAvailability(availData)
			setBlockedDates(blockedData)
			setVisibleWorkers(new Set(workerIds))
			setLoading(false)
		}
		load()
	}, [user])

	const toggleWorker = useCallback((id: string) => {
		setVisibleWorkers((prev) => {
			const next = new Set(prev)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})
	}, [])

	const gridStart = HOURS[0]! * 60
	const gridEnd = (HOURS[HOURS.length - 1]! + 1) * 60
	const visibleWorkersList = useMemo(() => workers.filter((w) => visibleWorkers.has(w.id)), [workers, visibleWorkers])

	// Pre-compute lookup maps for O(1) access in the grid (avoids .find() in tight render loops)
	const businessHoursMap = useMemo(() => {
		const map = new Map<number, BusinessHours>()
		for (const bh of businessHours) map.set(bh.day_of_week, bh)
		return map
	}, [businessHours])

	const availabilityMap = useMemo(() => {
		const map = new Map<string, WorkerAvailability>()
		for (const a of availability) {
			if (a.is_active) map.set(`${a.worker_id}-${a.day_of_week}`, a)
		}
		return map
	}, [availability])

	const blockedDatesSet = useMemo(() => {
		const set = new Set<string>()
		for (const b of blockedDates) set.add(`${b.worker_id}-${b.date}`)
		return set
	}, [blockedDates])

	// Pre-compute per-date values used across all hour rows
	const weekDateInfo = useMemo(() => weekDates.map((date) => {
		const dayOfWeek = date.getDay()
		const dateStr = formatDateStr(date)
		const isToday = dateStr === todayStr
		const bh = businessHoursMap.get(dayOfWeek)
		const isClosed = !bh || bh.is_closed
		const bizOpen = bh && !bh.is_closed ? timeToMinutes(bh.open_time) : 0
		const bizClose = bh && !bh.is_closed ? timeToMinutes(bh.close_time) : 0
		return { date, dayOfWeek, dateStr, isToday, isClosed, bizOpen, bizClose }
	}), [weekDates, todayStr, businessHoursMap])

	// Worker index map for stable color assignment
	const workerIndexMap = useMemo(() => {
		const map = new Map<string, number>()
		workers.forEach((w, i) => map.set(w.id, i))
		return map
	}, [workers])

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
							{weekDateInfo.map((info) => (
								<View key={info.dateStr} style={[styles.dayCol, info.isToday && styles.dayColToday]}>
									<Text style={styles.dayLabel}>{DAYS_SHORT[info.dayOfWeek]}</Text>
									<Text style={[styles.dayNumber, info.isToday && styles.dayNumberToday]}>{info.date.getDate()}</Text>
								</View>
							))}
						</View>

						{/* Time rows */}
						{HOURS.map((hour) => {
							const hourStart = hour * 60
							const hourEnd = (hour + 1) * 60
							const gridTotal = HOURS.length * ROW_HEIGHT
							const gridRange = gridEnd - gridStart

							return (
								<View key={hour} style={styles.row}>
									<View style={styles.timeCol}>
										<Text style={styles.timeLabel}>{formatHour(hour)}</Text>
									</View>
									{weekDateInfo.map((info, dayIdx) => {
										const isInBizHours = !info.isClosed && hourStart >= info.bizOpen && hourEnd <= info.bizClose

										return (
											<View
												key={dayIdx}
												style={[
													styles.cell,
													info.isToday && styles.cellToday,
													isInBizHours && styles.cellBizHours,
												]}
											>
												{visibleWorkersList.map((worker, wIdx) => {
													const wa = availabilityMap.get(`${worker.id}-${info.dayOfWeek}`)
													if (!wa) return null

													const availStart = timeToMinutes(wa.start_time)
													const availEnd = timeToMinutes(wa.end_time)
													if (hour !== Math.floor(availStart / 60)) return null

													const isBlocked = blockedDatesSet.has(`${worker.id}-${info.dateStr}`)
													const topPx = ((availStart - gridStart) / gridRange) * gridTotal
													const heightPx = ((availEnd - availStart) / gridRange) * gridTotal
													const rowStartPx = ((hourStart - gridStart) / gridRange) * gridTotal
													const color = CHART_COLORS[(workerIndexMap.get(worker.id) ?? 0) % CHART_COLORS.length]!

													return (
														<View
															key={worker.id}
															style={[
																styles.block,
																{
																	top: topPx - rowStartPx,
																	height: Math.min(heightPx, 300),
																	left: (wIdx / visibleWorkersList.length) * CELL_WIDTH,
																	width: CELL_WIDTH / visibleWorkersList.length,
																	backgroundColor: isBlocked ? '#FEE2E2' : color + '30',
																	borderLeftColor: isBlocked ? '#EF4444' : color,
																},
															]}
														>
															{isBlocked ? (
																<Text style={styles.blockedText} numberOfLines={1}>Off</Text>
															) : (
																<Text style={[styles.blockText, { color }]} numberOfLines={1}>
																	{worker.display_name.split(' ')[0]}
																</Text>
															)}
														</View>
													)
												})}
											</View>
										)
									})}
								</View>
							)
						})}
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
