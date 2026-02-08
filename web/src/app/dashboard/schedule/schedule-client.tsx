'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { BusinessHours, Worker, WorkerAvailability, WorkerBlockedDate } from '@/lib/types'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const CHART_COLORS = [
	'bg-chart-1',
	'bg-chart-2',
	'bg-chart-3',
	'bg-chart-4',
	'bg-chart-5',
]

interface Props {
	businessHours: BusinessHours[]
	workers: Pick<Worker, 'id' | 'display_name' | 'is_active'>[]
	availability: WorkerAvailability[]
	blockedDates: WorkerBlockedDate[]
}

function getWeekDates(offset: number): Date[] {
	const today = new Date()
	const startOfWeek = new Date(today)
	startOfWeek.setDate(today.getDate() - today.getDay() + offset * 7)

	return Array.from({ length: 7 }, (_, i) => {
		const d = new Date(startOfWeek)
		d.setDate(startOfWeek.getDate() + i)
		return d
	})
}

function timeToMinutes(time: string): number {
	const [h, m] = time.split(':').map(Number)
	return (h ?? 0) * 60 + (m ?? 0)
}

function formatDate(date: Date): string {
	return date.toISOString().split('T')[0] ?? ''
}

export function ScheduleClient({ businessHours, workers, availability, blockedDates }: Props) {
	const [weekOffset, setWeekOffset] = useState(0)
	const [visibleWorkers, setVisibleWorkers] = useState<Set<string>>(
		new Set(workers.map((w) => w.id))
	)

	const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset])

	function toggleWorkerVisibility(workerId: string) {
		setVisibleWorkers((prev) => {
			const next = new Set(prev)
			if (next.has(workerId)) {
				next.delete(workerId)
			} else {
				next.add(workerId)
			}
			return next
		})
	}

	const startDate = weekDates[0]
	const endDate = weekDates[6]

	return (
		<div>
			<div className="mb-8">
				<h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
				<p className="text-muted-foreground">Weekly overview of business hours and worker availability.</p>
			</div>

			{/* Navigation */}
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Button variant="outline" size="icon" onClick={() => setWeekOffset((p) => p - 1)}>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
						Today
					</Button>
					<Button variant="outline" size="icon" onClick={() => setWeekOffset((p) => p + 1)}>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
				<p className="text-sm font-medium text-muted-foreground">
					{startDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
					{' — '}
					{endDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
				</p>
			</div>

			{/* Worker filter */}
			{workers.length > 0 && (
				<div className="mb-6 flex flex-wrap gap-2">
					{workers.map((worker, index) => (
						<button
							key={worker.id}
							onClick={() => toggleWorkerVisibility(worker.id)}
							className={cn(
								'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
								visibleWorkers.has(worker.id)
									? 'bg-primary/10 border-primary/30 text-primary'
									: 'bg-muted text-muted-foreground'
							)}
						>
							<span
								className={cn(
									'h-2.5 w-2.5 rounded-full',
									CHART_COLORS[index % CHART_COLORS.length]
								)}
							/>
							{worker.display_name}
						</button>
					))}
				</div>
			)}

			{/* Weekly Grid */}
			<motion.div
				key={weekOffset}
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.2 }}
			>
				<div className="grid grid-cols-7 gap-2">
					{weekDates.map((date, dayIndex) => {
						const dayOfWeek = date.getDay()
						const bizHours = businessHours.find((h) => h.day_of_week === dayOfWeek)
						const isToday = formatDate(date) === formatDate(new Date())
						const dateStr = formatDate(date)

						return (
							<Card
								key={dayIndex}
								className={cn(
									'min-h-48',
									isToday && 'ring-2 ring-primary/30'
								)}
							>
								<CardHeader className="px-3 py-2">
									<div className="text-center">
										<p className="text-xs font-medium text-muted-foreground">{DAYS[dayOfWeek]}</p>
										<p className={cn(
											'text-lg font-bold',
											isToday && 'text-primary'
										)}>
											{date.getDate()}
										</p>
									</div>
								</CardHeader>
								<CardContent className="px-2 pb-2 space-y-1">
									{/* Business hours */}
									{bizHours && !bizHours.is_closed ? (
										<div className="rounded bg-muted px-2 py-1 text-center">
											<p className="text-[10px] font-medium text-muted-foreground">
												{bizHours.open_time.slice(0, 5)} - {bizHours.close_time.slice(0, 5)}
											</p>
										</div>
									) : (
										<div className="rounded bg-muted/50 px-2 py-1 text-center">
											<p className="text-[10px] text-muted-foreground">Closed</p>
										</div>
									)}

									{/* Worker availability bars */}
									{workers.map((worker, wIndex) => {
										if (!visibleWorkers.has(worker.id)) return null

										const workerAvail = availability.find(
											(a) => a.worker_id === worker.id && a.day_of_week === dayOfWeek && a.is_active
										)
										const isBlocked = blockedDates.some(
											(b) => b.worker_id === worker.id && b.date === dateStr
										)

										if (!workerAvail && !isBlocked) return null

										return (
											<div
												key={worker.id}
												className={cn(
													'rounded px-1.5 py-0.5 text-[9px] font-medium text-primary-foreground',
													isBlocked
														? 'bg-destructive/60 line-through'
														: CHART_COLORS[wIndex % CHART_COLORS.length]
												)}
												title={`${worker.display_name}${isBlocked ? ' (blocked)' : ''}`}
											>
												{isBlocked ? (
													<span className="text-destructive-foreground">Off</span>
												) : workerAvail ? (
													<span>{workerAvail.start_time.slice(0, 5)}-{workerAvail.end_time.slice(0, 5)}</span>
												) : null}
											</div>
										)
									})}
								</CardContent>
							</Card>
						)
					})}
				</div>
			</motion.div>

			{workers.length === 0 && (
				<div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
					<CalendarDays className="h-10 w-10 text-muted-foreground/50" />
					<h3 className="mt-4 text-lg font-semibold">No workers to display</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Add team members in the Workers page to see their schedule here.
					</p>
				</div>
			)}
		</div>
	)
}
