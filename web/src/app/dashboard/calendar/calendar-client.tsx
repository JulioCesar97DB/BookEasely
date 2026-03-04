'use client'

import type { BusinessHours } from '@/lib/types'
import { addDays, startOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getBookingsForRange } from '@/app/dashboard/bookings/actions'
import { CalendarHeader } from './components/calendar-header'
import { WeekView } from './components/week-view'
import { MonthView } from './components/month-view'
import { BookingDetailPanel } from './components/booking-detail-panel'

export interface CalendarBooking {
	id: string
	date: string
	start_time: string
	end_time: string
	status: string
	note: string | null
	cancellation_reason: string | null
	worker_id: string
	services: { name: string; duration_minutes: number; price: number } | null
	workers: { id: string; display_name: string } | null
	profiles: { full_name: string; phone: string } | null
}

interface CalendarClientProps {
	businessId: string
	workers: { id: string; display_name: string; avatar_url: string | null; is_active: boolean }[]
	businessHours: BusinessHours[]
}

export type CalendarView = 'week' | 'month'
export type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed'

export function CalendarClient({ businessId, workers, businessHours }: CalendarClientProps) {
	const [view, setView] = useState<CalendarView>('week')
	const [weekOffset, setWeekOffset] = useState(0)
	const [monthOffset, setMonthOffset] = useState(0)
	const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null)
	const [visibleWorkers, setVisibleWorkers] = useState<Set<string>>(() => new Set(workers.map((w) => w.id)))
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
	const [bookings, setBookings] = useState<CalendarBooking[]>([])
	const [loading, setLoading] = useState(true)

	// Compute date ranges
	const today = useMemo(() => new Date(), [])

	const weekDates = useMemo(() => {
		const base = addDays(today, weekOffset * 7)
		const start = startOfWeek(base, { weekStartsOn: 1 }) // Monday
		return Array.from({ length: 7 }, (_, i) => addDays(start, i))
	}, [today, weekOffset])

	const monthDate = useMemo(() => {
		const d = new Date(today)
		d.setMonth(d.getMonth() + monthOffset)
		return d
	}, [today, monthOffset])

	const dateRange = useMemo(() => {
		if (view === 'week') {
			return {
				start: format(weekDates[0], 'yyyy-MM-dd'),
				end: format(weekDates[6], 'yyyy-MM-dd'),
			}
		}
		return {
			start: format(startOfMonth(monthDate), 'yyyy-MM-dd'),
			end: format(endOfMonth(monthDate), 'yyyy-MM-dd'),
		}
	}, [view, weekDates, monthDate])

	// Fetch bookings for current range
	const fetchBookings = useCallback(async () => {
		setLoading(true)
		const result = await getBookingsForRange(businessId, dateRange.start, dateRange.end)
		if (result.data) {
			setBookings(result.data as unknown as CalendarBooking[])
		}
		setLoading(false)
	}, [businessId, dateRange.start, dateRange.end])

	useEffect(() => {
		let cancelled = false
		async function load() {
			setLoading(true)
			const result = await getBookingsForRange(businessId, dateRange.start, dateRange.end)
			if (!cancelled && result.data) {
				setBookings(result.data as unknown as CalendarBooking[])
			}
			if (!cancelled) setLoading(false)
		}
		load()
		return () => { cancelled = true }
	}, [businessId, dateRange.start, dateRange.end])

	// Filtered bookings
	const filteredBookings = useMemo(() => {
		return bookings.filter((b) => {
			if (!visibleWorkers.has(b.worker_id)) return false
			if (statusFilter !== 'all' && b.status !== statusFilter) return false
			return true
		})
	}, [bookings, visibleWorkers, statusFilter])

	// Worker color map
	const workerColorMap = useMemo(() => {
		const map = new Map<string, number>()
		workers.forEach((w, i) => map.set(w.id, i % 5))
		return map
	}, [workers])

	// Navigation handlers
	const goToday = useCallback(() => {
		if (view === 'week') setWeekOffset(0)
		else setMonthOffset(0)
	}, [view])

	const goPrev = useCallback(() => {
		if (view === 'week') setWeekOffset((o) => o - 1)
		else setMonthOffset((o) => o - 1)
	}, [view])

	const goNext = useCallback(() => {
		if (view === 'week') setWeekOffset((o) => o + 1)
		else setMonthOffset((o) => o + 1)
	}, [view])

	const toggleWorker = useCallback((workerId: string) => {
		setVisibleWorkers((prev) => {
			const next = new Set(prev)
			if (next.has(workerId)) next.delete(workerId)
			else next.add(workerId)
			return next
		})
	}, [])

	const goToWeekOf = useCallback((date: Date) => {
		const diff = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7))
		setWeekOffset(diff)
		setView('week')
	}, [today])

	const handleBookingAction = useCallback(() => {
		setSelectedBooking(null)
		fetchBookings()
	}, [fetchBookings])

	return (
		<div className="space-y-4">
			<CalendarHeader
				view={view}
				onViewChange={setView}
				weekDates={weekDates}
				monthDate={monthDate}
				onPrev={goPrev}
				onNext={goNext}
				onToday={goToday}
				workers={workers}
				visibleWorkers={visibleWorkers}
				onToggleWorker={toggleWorker}
				statusFilter={statusFilter}
				onStatusFilterChange={setStatusFilter}
				bookingCount={filteredBookings.length}
				loading={loading}
			/>

			{view === 'week' ? (
				<WeekView
					weekDates={weekDates}
					bookings={filteredBookings}
					businessHours={businessHours}
					workerColorMap={workerColorMap}
					onSelectBooking={setSelectedBooking}
					weekOffset={weekOffset}
				/>
			) : (
				<MonthView
					monthDate={monthDate}
					bookings={filteredBookings}
					onSelectDay={goToWeekOf}
					monthOffset={monthOffset}
				/>
			)}

			<BookingDetailPanel
				booking={selectedBooking}
				onClose={() => setSelectedBooking(null)}
				onAction={handleBookingAction}
				workerColorMap={workerColorMap}
			/>
		</div>
	)
}
