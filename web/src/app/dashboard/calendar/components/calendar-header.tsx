'use client'

import { Button } from '@/components/ui/button'
import { SCHEDULE_CHART_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import type { CalendarView, StatusFilter } from '../calendar-client'

interface CalendarHeaderProps {
	view: CalendarView
	onViewChange: (view: CalendarView) => void
	weekDates: Date[]
	monthDate: Date
	onPrev: () => void
	onNext: () => void
	onToday: () => void
	workers: { id: string; display_name: string }[]
	visibleWorkers: Set<string>
	onToggleWorker: (id: string) => void
	statusFilter: StatusFilter
	onStatusFilterChange: (filter: StatusFilter) => void
	bookingCount: number
	loading: boolean
}

const statusOptions: { value: StatusFilter; label: string }[] = [
	{ value: 'all', label: 'All' },
	{ value: 'pending', label: 'Pending' },
	{ value: 'confirmed', label: 'Confirmed' },
	{ value: 'completed', label: 'Completed' },
]

export function CalendarHeader({
	view,
	onViewChange,
	weekDates,
	monthDate,
	onPrev,
	onNext,
	onToday,
	workers,
	visibleWorkers,
	onToggleWorker,
	statusFilter,
	onStatusFilterChange,
	bookingCount,
	loading,
}: CalendarHeaderProps) {
	const dateLabel = view === 'week'
		? `${format(weekDates[0], 'MMM d')} – ${format(weekDates[6], 'MMM d, yyyy')}`
		: format(monthDate, 'MMMM yyyy')

	return (
		<div className="space-y-3">
			{/* Top row: Title + Navigation + View toggle */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
						<CalendarDays className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h1 className="text-xl font-semibold tracking-tight">Calendar</h1>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<AnimatePresence mode="wait">
								<motion.span
									key={bookingCount}
									initial={{ opacity: 0, y: -4 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 4 }}
									transition={{ duration: 0.15 }}
								>
									{bookingCount} booking{bookingCount !== 1 ? 's' : ''}
								</motion.span>
							</AnimatePresence>
							{loading && <Loader2 className="h-3 w-3 animate-spin" />}
						</div>
					</div>
				</div>

				{/* Navigation */}
				<div className="flex items-center gap-1.5">
					<Button variant="outline" size="icon" className="h-8 w-8" onClick={onPrev}>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button variant="outline" size="sm" className="h-8 px-3 text-xs font-medium" onClick={onToday}>
						Today
					</Button>
					<Button variant="outline" size="icon" className="h-8 w-8" onClick={onNext}>
						<ChevronRight className="h-4 w-4" />
					</Button>
					<div className="ml-2 min-w-[160px]">
						<AnimatePresence mode="wait">
							<motion.span
								key={dateLabel}
								initial={{ opacity: 0, x: 10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -10 }}
								transition={{ duration: 0.15 }}
								className="text-sm font-medium"
							>
								{dateLabel}
							</motion.span>
						</AnimatePresence>
					</div>
				</div>

				{/* View toggle */}
				<div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
					{(['week', 'month'] as const).map((v) => (
						<button
							key={v}
							type="button"
							onClick={() => onViewChange(v)}
							className={cn(
								'relative rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
								view === v ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
							)}
						>
							{view === v && (
								<motion.div
									layoutId="view-toggle"
									className="absolute inset-0 rounded-md bg-background shadow-sm"
									transition={{ type: 'spring', stiffness: 400, damping: 30 }}
								/>
							)}
							<span className="relative capitalize">{v}</span>
						</button>
					))}
				</div>
			</div>

			{/* Bottom row: Worker chips + Status filter */}
			<div className="flex flex-wrap items-center gap-2">
				{/* Worker filter chips */}
				{workers.map((worker, index) => {
					const colorIndex = index % SCHEDULE_CHART_COLORS.length
					const isVisible = visibleWorkers.has(worker.id)
					return (
						<button
							key={worker.id}
							type="button"
							onClick={() => onToggleWorker(worker.id)}
							className={cn(
								'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
								isVisible
									? 'border-transparent bg-primary/10 text-foreground shadow-sm'
									: 'border-border/50 bg-transparent text-muted-foreground opacity-50 hover:opacity-75'
							)}
						>
							<span
								className={cn(
									'h-2.5 w-2.5 rounded-full transition-opacity',
									SCHEDULE_CHART_COLORS[colorIndex].bg,
									!isVisible && 'opacity-30'
								)}
							/>
							{worker.display_name}
						</button>
					)
				})}

				<div className="h-4 w-px bg-border/50 mx-1 hidden sm:block" />

				{/* Status filter */}
				{statusOptions.map((option) => (
					<button
						key={option.value}
						type="button"
						onClick={() => onStatusFilterChange(option.value)}
						className={cn(
							'relative rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
							statusFilter === option.value
								? 'text-foreground'
								: 'text-muted-foreground hover:text-foreground'
						)}
					>
						{statusFilter === option.value && (
							<motion.div
								layoutId="status-filter"
								className="absolute inset-0 rounded-full bg-muted shadow-sm"
								transition={{ type: 'spring', stiffness: 400, damping: 30 }}
							/>
						)}
						<span className="relative">{option.label}</span>
					</button>
				))}
			</div>
		</div>
	)
}
