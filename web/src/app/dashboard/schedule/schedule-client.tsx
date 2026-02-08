'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { BusinessHours, Worker, WorkerAvailability, WorkerBlockedDate } from '@/lib/types'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 11 }, (_, i) => i + 7) // 7am - 5pm
const CHART_COLORS = [
	{ bg: 'bg-chart-1', text: 'text-chart-1' },
	{ bg: 'bg-chart-2', text: 'text-chart-2' },
	{ bg: 'bg-chart-3', text: 'text-chart-3' },
	{ bg: 'bg-chart-4', text: 'text-chart-4' },
	{ bg: 'bg-chart-5', text: 'text-chart-5' },
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

function formatHour(hour: number): string {
	if (hour === 0) return '12 AM'
	if (hour < 12) return `${hour} AM`
	if (hour === 12) return '12 PM'
	return `${hour - 12} PM`
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

	// Grid range in minutes (7am = 420, 6pm = 1080)
	const gridStart = HOURS[0]! * 60
	const gridEnd = (HOURS[HOURS.length - 1]! + 1) * 60

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
									CHART_COLORS[index % CHART_COLORS.length]?.bg
								)}
							/>
							{worker.display_name}
						</button>
					))}
				</div>
			)}

			{/* Time-slot based weekly grid */}
			{workers.length > 0 ? (
				<motion.div
					key={weekOffset}
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.2 }}
				>
					<Card>
						<CardContent className="p-0 overflow-x-auto">
							<div className="min-w-175">
								{/* Header row */}
								<div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
									<div className="p-2" />
									{weekDates.map((date) => {
										const isToday = formatDate(date) === formatDate(new Date())
										return (
											<div
												key={formatDate(date)}
												className={cn(
													'p-2 text-center border-l',
													isToday && 'bg-primary/5'
												)}
											>
												<p className="text-xs font-medium text-muted-foreground">{DAYS[date.getDay()]}</p>
												<p className={cn(
													'text-sm font-bold',
													isToday && 'text-primary'
												)}>
													{date.getDate()}
												</p>
											</div>
										)
									})}
								</div>

								{/* Time rows */}
								{HOURS.map((hour) => {
									return (
										<div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b last:border-b-0 h-12">
											<div className="p-1 text-right pr-2 flex items-start justify-end">
												<span className="text-[10px] text-muted-foreground -mt-1.5">{formatHour(hour)}</span>
											</div>
											{weekDates.map((date, dayIndex) => {
												const dayOfWeek = date.getDay()
												const isToday = formatDate(date) === formatDate(new Date())
												const dateStr = formatDate(date)
												const bizHours = businessHours.find((h) => h.day_of_week === dayOfWeek)
												const isClosed = !bizHours || bizHours.is_closed

												// Check if this hour falls within business hours
												const bizOpen = bizHours && !bizHours.is_closed ? timeToMinutes(bizHours.open_time) : 0
												const bizClose = bizHours && !bizHours.is_closed ? timeToMinutes(bizHours.close_time) : 0
												const hourStart = hour * 60
												const hourEnd = (hour + 1) * 60
												const isInBizHours = !isClosed && hourStart >= bizOpen && hourEnd <= bizClose

												return (
													<div
														key={dayIndex}
														className={cn(
															'border-l relative',
															isToday && 'bg-primary/2',
															isInBizHours ? 'bg-muted/30' : ''
														)}
													>
														{/* Worker availability blocks */}
														{workers.map((worker, wIndex) => {
															if (!visibleWorkers.has(worker.id)) return null

															const workerAvail = availability.find(
																(a) => a.worker_id === worker.id && a.day_of_week === dayOfWeek && a.is_active
															)
															const isBlocked = blockedDates.some(
																(b) => b.worker_id === worker.id && b.date === dateStr
															)

															if (!workerAvail) return null

															const availStart = timeToMinutes(workerAvail.start_time)
															const availEnd = timeToMinutes(workerAvail.end_time)

															// Only render in the first hour that overlaps
															if (hourStart !== Math.max(availStart, Math.floor(availStart / 60) * 60)) return null

															const topPx = ((availStart - gridStart) / (gridEnd - gridStart)) * (HOURS.length * 48)
															const heightPx = ((availEnd - availStart) / (gridEnd - gridStart)) * (HOURS.length * 48)

															// Calculate position relative to the grid
															const rowStartPx = ((hour * 60 - gridStart) / (gridEnd - gridStart)) * (HOURS.length * 48)

															return (
																<div
																	key={worker.id}
																	className={cn(
																		'absolute rounded-sm text-[9px] font-medium px-1 py-0.5 overflow-hidden z-10',
																		isBlocked
																			? 'bg-destructive/20 text-destructive line-through border border-destructive/30'
																			: `${CHART_COLORS[wIndex % CHART_COLORS.length]?.bg} text-primary-foreground opacity-80`
																	)}
																	style={{
																		top: topPx - rowStartPx,
																		height: Math.min(heightPx, 200),
																		left: `${(wIndex * 100) / Math.max(workers.filter(w => visibleWorkers.has(w.id)).length, 1)}%`,
																		width: `${100 / Math.max(workers.filter(w => visibleWorkers.has(w.id)).length, 1)}%`,
																	}}
																	title={`${worker.display_name}: ${workerAvail.start_time.slice(0, 5)}-${workerAvail.end_time.slice(0, 5)}${isBlocked ? ' (blocked)' : ''}`}
																>
																	{!isBlocked && (
																		<span className="truncate block">{worker.display_name.split(' ')[0]}</span>
																	)}
																</div>
															)
														})}
													</div>
												)
											})}
										</div>
									)
								})}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			) : (
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
