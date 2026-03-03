'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ServiceWorker, Worker, WorkerAvailability, WorkerBlockedDate } from '@/lib/types'
import { motion } from 'framer-motion'
import { CalendarOff, ChevronDown, ChevronUp, ClipboardList, Clock } from 'lucide-react'
import { AvailabilitySection } from './availability-section'
import { BlockedDatesSection } from './blocked-dates-section'

interface WorkerCardProps {
	worker: Worker
	index: number
	workerAvailability: WorkerAvailability[]
	workerBlockedDates: WorkerBlockedDate[]
	workerServiceCount: number
	isExpanded: boolean
	onEdit: (worker: Worker) => void
	onToggleExpand: (workerId: string) => void
}

function getAvailabilitySummary(workerAvail: WorkerAvailability[]): string {
	const activeDays = workerAvail.filter((a) => a.is_active).sort((a, b) => a.day_of_week - b.day_of_week)
	if (activeDays.length === 0) return 'No schedule set'

	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
	const times = activeDays[0]
	const timeStr = times ? `${times.start_time.slice(0, 5)}–${times.end_time.slice(0, 5)}` : ''

	// Check for consecutive ranges
	const indices = activeDays.map((d) => d.day_of_week)
	if (indices.length >= 2) {
		const first = indices[0]!
		const last = indices[indices.length - 1]!
		const isConsecutive = indices.every((v, i) => v === first + i)
		if (isConsecutive) {
			return `${dayNames[first]}–${dayNames[last]}, ${timeStr}`
		}
	}

	return `${activeDays.length} days/week, ${timeStr}`
}

export function WorkerCard({
	worker,
	index,
	workerAvailability,
	workerBlockedDates,
	workerServiceCount,
	isExpanded,
	onEdit,
	onToggleExpand,
}: WorkerCardProps) {
	const nextBlockedDate = workerBlockedDates.find((b) => b.date >= new Date().toISOString().split('T')[0]!)
	const availSummary = getAvailabilitySummary(workerAvailability)

	return (
		<motion.div
			key={worker.id}
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.05 }}
		>
			<Card className="transition-shadow hover:shadow-md">
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
								{worker.display_name.charAt(0).toUpperCase()}
							</div>
							<div>
								<CardTitle className="text-base">{worker.display_name}</CardTitle>
								{worker.bio && (
									<p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
										{worker.bio}
									</p>
								)}
							</div>
						</div>
						<Badge variant={worker.is_active ? 'default' : 'secondary'}>
							{worker.is_active ? 'Active' : 'Inactive'}
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					{/* Stats */}
					<div className="flex flex-wrap gap-3 mb-3 text-xs text-muted-foreground">
						<span className="inline-flex items-center gap-1">
							<ClipboardList className="h-3 w-3" />
							{workerServiceCount} service{workerServiceCount !== 1 ? 's' : ''}
						</span>
						<span className="inline-flex items-center gap-1">
							<Clock className="h-3 w-3" />
							{availSummary}
						</span>
						{nextBlockedDate && (
							<span className="inline-flex items-center gap-1 text-amber-600">
								<CalendarOff className="h-3 w-3" />
								Off {new Date(nextBlockedDate.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
							</span>
						)}
					</div>

					{/* Specialties */}
					{worker.specialties && worker.specialties.length > 0 && (
						<div className="flex flex-wrap gap-1.5 mb-3">
							{worker.specialties.map((spec) => (
								<Badge key={spec} variant="outline" className="text-xs">
									{spec}
								</Badge>
							))}
						</div>
					)}

					{/* Member since */}
					<p className="text-[11px] text-muted-foreground/60 mb-3">
						Member since {new Date(worker.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
					</p>

					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => onEdit(worker)}
						>
							Edit
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onToggleExpand(worker.id)}
							className="gap-1"
						>
							{isExpanded ? (
								<>
									<ChevronUp className="h-4 w-4" />
									Less
								</>
							) : (
								<>
									<ChevronDown className="h-4 w-4" />
									Schedule
								</>
							)}
						</Button>
					</div>

					{isExpanded && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="mt-4 space-y-4 border-t pt-4"
						>
							<AvailabilitySection
								workerId={worker.id}
								availability={workerAvailability}
							/>
							<BlockedDatesSection
								workerId={worker.id}
								blockedDates={workerBlockedDates}
							/>
						</motion.div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	)
}
