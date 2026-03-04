'use client'

import { cn } from '@/lib/utils'
import {
	startOfMonth,
	endOfMonth,
	startOfWeek,
	endOfWeek,
	addDays,
	isSameMonth,
	isToday,
	format,
} from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import type { CalendarBooking } from '../calendar-client'

interface MonthViewProps {
	monthDate: Date
	bookings: CalendarBooking[]
	onSelectDay: (date: Date) => void
	monthOffset: number
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function MonthView({ monthDate, bookings, onSelectDay, monthOffset }: MonthViewProps) {
	// Build calendar grid
	const monthStart = startOfMonth(monthDate)
	const monthEnd = endOfMonth(monthDate)
	const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
	const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

	const days: Date[] = []
	let current = calendarStart
	while (current <= calendarEnd) {
		days.push(current)
		current = addDays(current, 1)
	}

	// Group bookings by date
	const bookingsByDate = new Map<string, { pending: number; confirmed: number; completed: number; cancelled: number; total: number }>()
	for (const b of bookings) {
		if (!bookingsByDate.has(b.date)) {
			bookingsByDate.set(b.date, { pending: 0, confirmed: 0, completed: 0, cancelled: 0, total: 0 })
		}
		const entry = bookingsByDate.get(b.date)!
		entry.total++
		if (b.status === 'pending') entry.pending++
		else if (b.status === 'confirmed') entry.confirmed++
		else if (b.status === 'completed') entry.completed++
		else if (b.status === 'cancelled') entry.cancelled++
	}

	// Find max bookings for heatmap
	const maxBookings = Math.max(1, ...Array.from(bookingsByDate.values()).map((v) => v.total))

	const weeks: Date[][] = []
	for (let i = 0; i < days.length; i += 7) {
		weeks.push(days.slice(i, i + 7))
	}

	return (
		<div className="rounded-xl border bg-card shadow-sm overflow-hidden">
			{/* Day headers */}
			<div className="grid grid-cols-7 border-b bg-muted/20">
				{DAY_LABELS.map((label) => (
					<div key={label} className="flex items-center justify-center py-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
						{label}
					</div>
				))}
			</div>

			{/* Calendar grid */}
			<AnimatePresence mode="wait">
				<motion.div
					key={monthOffset}
					initial={{ opacity: 0, y: monthOffset > 0 ? 20 : -20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: monthOffset > 0 ? -20 : 20 }}
					transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
				>
					{weeks.map((week, wi) => (
						<div key={wi} className="grid grid-cols-7 border-b last:border-b-0">
							{week.map((day, di) => {
								const dateStr = format(day, 'yyyy-MM-dd')
								const inMonth = isSameMonth(day, monthDate)
								const today = isToday(day)
								const stats = bookingsByDate.get(dateStr)
								const intensity = stats ? stats.total / maxBookings : 0

								return (
									<motion.button
										key={dateStr}
										type="button"
										onClick={() => onSelectDay(day)}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ duration: 0.15, delay: (wi * 7 + di) * 0.01 }}
										className={cn(
											'relative flex flex-col items-start p-2 min-h-[80px] border-r last:border-r-0 transition-colors',
											'hover:bg-muted/30 cursor-pointer',
											!inMonth && 'opacity-40',
											today && 'bg-primary/[0.04]'
										)}
									>
										{/* Heatmap background */}
										{stats && stats.total > 0 && inMonth && (
											<div
												className="absolute inset-0 bg-primary/[0.04] transition-opacity"
												style={{ opacity: intensity * 0.8 }}
											/>
										)}

										{/* Day number */}
										<span className={cn(
											'relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
											today ? 'bg-primary text-primary-foreground' : 'text-foreground'
										)}>
											{format(day, 'd')}
										</span>

										{/* Booking indicators */}
										{stats && stats.total > 0 && (
											<div className="relative z-10 mt-1 flex flex-wrap gap-1">
												{stats.pending > 0 && (
													<StatusDot color="bg-yellow-400 dark:bg-yellow-500" count={stats.pending} />
												)}
												{stats.confirmed > 0 && (
													<StatusDot color="bg-blue-400 dark:bg-blue-500" count={stats.confirmed} />
												)}
												{stats.completed > 0 && (
													<StatusDot color="bg-green-400 dark:bg-green-500" count={stats.completed} />
												)}
											</div>
										)}

										{/* Total count for busy days */}
										{stats && stats.total >= 3 && (
											<span className="relative z-10 mt-auto text-[9px] font-medium text-muted-foreground">
												{stats.total} bookings
											</span>
										)}
									</motion.button>
								)
							})}
						</div>
					))}
				</motion.div>
			</AnimatePresence>
		</div>
	)
}

function StatusDot({ color, count }: { color: string; count: number }) {
	return (
		<span className="flex items-center gap-0.5">
			<span className={cn('h-1.5 w-1.5 rounded-full', color)} />
			{count > 1 && (
				<span className="text-[8px] font-medium text-muted-foreground">{count}</span>
			)}
		</span>
	)
}
