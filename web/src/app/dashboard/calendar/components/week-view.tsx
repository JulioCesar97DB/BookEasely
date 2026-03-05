'use client'

import type { BusinessHours } from '@/lib/types'
import { CALENDAR_HOURS, HALF_HOUR_HEIGHT } from '@/lib/constants'
import { formatHour, formatDateStr } from '@/lib/format'
import { cn } from '@/lib/utils'
import { format, isToday } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef } from 'react'
import { BookingBlock } from './booking-block'
import { CurrentTimeLine } from './current-time-line'
import type { CalendarBooking } from '../calendar-client'

interface WeekViewProps {
	weekDates: Date[]
	bookings: CalendarBooking[]
	businessHours: BusinessHours[]
	workerColorMap: Map<string, number>
	onSelectBooking: (booking: CalendarBooking) => void
	weekOffset: number
}

const FIRST_HOUR = CALENDAR_HOURS[0]
const TOTAL_HOURS = CALENDAR_HOURS.length
const GRID_HEIGHT = TOTAL_HOURS * HALF_HOUR_HEIGHT * 2

export function WeekView({ weekDates, bookings, businessHours, workerColorMap, onSelectBooking, weekOffset }: WeekViewProps) {
	const gridRef = useRef<HTMLDivElement>(null)

	// Group bookings by date
	const bookingsByDate = new Map<string, CalendarBooking[]>()
	for (const b of bookings) {
		const key = b.date
		if (!bookingsByDate.has(key)) bookingsByDate.set(key, [])
		bookingsByDate.get(key)!.push(b)
	}

	// Business hours lookup: day_of_week -> { open_time, close_time, is_closed }
	const hoursMap = new Map<number, BusinessHours>()
	for (const h of businessHours) {
		hoursMap.set(h.day_of_week, h)
	}

	return (
		<div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
			<div className="min-w-[640px]">
			{/* Day headers */}
			<div className="grid grid-cols-[60px_repeat(7,1fr)] border-b bg-muted/20">
				<div className="border-r" />
				{weekDates.map((date) => {
					const today = isToday(date)
					return (
						<div
							key={date.toISOString()}
							className={cn(
								'flex flex-col items-center justify-center py-2.5 border-r last:border-r-0 transition-colors',
								today && 'bg-primary/5'
							)}
						>
							<span className={cn(
								'text-[10px] font-medium uppercase tracking-wider',
								today ? 'text-primary' : 'text-muted-foreground'
							)}>
								{format(date, 'EEE')}
							</span>
							<span className={cn(
								'mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold transition-colors',
								today ? 'bg-primary text-primary-foreground' : 'text-foreground'
							)}>
								{format(date, 'd')}
							</span>
						</div>
					)
				})}
			</div>

			{/* Time grid */}
			<div className="overflow-y-auto max-h-[calc(100svh-280px)]" ref={gridRef}>
				<AnimatePresence mode="wait">
					<motion.div
						key={weekOffset}
						initial={{ opacity: 0, x: weekOffset > 0 ? 30 : -30 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: weekOffset > 0 ? -30 : 30 }}
						transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
						className="grid grid-cols-[60px_repeat(7,1fr)] relative"
						style={{ height: GRID_HEIGHT }}
					>
						{/* Time labels column */}
						<div className="border-r relative">
							{CALENDAR_HOURS.map((hour) => (
								<div
									key={hour}
									className="absolute w-full flex items-start justify-end pr-2"
									style={{ top: (hour - FIRST_HOUR) * HALF_HOUR_HEIGHT * 2 }}
								>
									<span className="text-[10px] font-medium text-muted-foreground -mt-1.5">
										{formatHour(hour)}
									</span>
								</div>
							))}
						</div>

						{/* Day columns */}
						{weekDates.map((date) => {
							const dateStr = formatDateStr(date)
							const dayBookings = bookingsByDate.get(dateStr) ?? []
							const dayOfWeek = date.getDay()
							const hours = hoursMap.get(dayOfWeek)
							const today = isToday(date)

							return (
								<DayColumn
									key={dateStr}
									date={date}
									dateStr={dateStr}
									bookings={dayBookings}
									businessHour={hours}
									isToday={today}
									workerColorMap={workerColorMap}
									onSelectBooking={onSelectBooking}
								/>
							)
						})}

						{/* Current time line */}
						<CurrentTimeLine weekDates={weekDates} />
					</motion.div>
				</AnimatePresence>
			</div>
			</div>
		</div>
	)
}

// ── Day Column ──────────────────────────────────────────────────────

interface DayColumnProps {
	date: Date
	dateStr: string
	bookings: CalendarBooking[]
	businessHour?: BusinessHours
	isToday: boolean
	workerColorMap: Map<string, number>
	onSelectBooking: (booking: CalendarBooking) => void
}

function DayColumn({ bookings, businessHour, isToday, workerColorMap, onSelectBooking }: DayColumnProps) {
	const isClosed = businessHour?.is_closed ?? true

	return (
		<div className={cn('relative border-r last:border-r-0', isToday && 'bg-primary/[0.03]')}>
			{/* Hour grid lines */}
			{CALENDAR_HOURS.map((hour) => (
				<div key={hour}>
					{/* Full hour line */}
					<div
						className="absolute w-full border-t border-border/40"
						style={{ top: (hour - FIRST_HOUR) * HALF_HOUR_HEIGHT * 2 }}
					/>
					{/* Half hour line */}
					<div
						className="absolute w-full border-t border-border/20 border-dashed"
						style={{ top: (hour - FIRST_HOUR) * HALF_HOUR_HEIGHT * 2 + HALF_HOUR_HEIGHT }}
					/>
				</div>
			))}

			{/* Closed hours overlay */}
			{isClosed && (
				<div className="absolute inset-0 bg-muted/10 z-[1]" />
			)}
			{!isClosed && businessHour && (
				<>
					{/* Before opening */}
					<ClosedOverlay
						startHour={FIRST_HOUR}
						endTime={businessHour.open_time}
					/>
					{/* After closing */}
					<ClosedOverlay
						startTime={businessHour.close_time}
						endHour={FIRST_HOUR + CALENDAR_HOURS.length}
					/>
				</>
			)}

			{/* Booking blocks */}
			{bookings.map((booking, index) => (
				<BookingBlock
					key={booking.id}
					booking={booking}
					colorIndex={workerColorMap.get(booking.worker_id) ?? 0}
					onClick={() => onSelectBooking(booking)}
					index={index}
				/>
			))}
		</div>
	)
}

// ── Closed Hours Overlay ────────────────────────────────────────────

function ClosedOverlay({
	startHour,
	endHour,
	startTime,
	endTime,
}: {
	startHour?: number
	endHour?: number
	startTime?: string
	endTime?: string
}) {
	const FIRST = CALENDAR_HOURS[0]
	const topMinutes = startTime
		? timeToMin(startTime) - FIRST * 60
		: (startHour! - FIRST) * 60
	const bottomMinutes = endTime
		? timeToMin(endTime) - FIRST * 60
		: (endHour! - FIRST) * 60

	if (bottomMinutes <= topMinutes) return null

	const top = (topMinutes / 60) * HALF_HOUR_HEIGHT * 2
	const height = ((bottomMinutes - topMinutes) / 60) * HALF_HOUR_HEIGHT * 2

	return (
		<div
			className="absolute w-full bg-muted/10 z-[1]"
			style={{ top, height }}
		/>
	)
}

function timeToMin(time: string): number {
	const [h, m] = time.split(':').map(Number)
	return h * 60 + m
}
