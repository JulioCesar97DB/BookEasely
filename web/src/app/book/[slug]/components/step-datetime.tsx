'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import type { TimeSlot } from '@/lib/booking/time-slots'
import { formatTime } from '@/lib/format'
import type { Service, Worker } from '@/lib/types'
import {
	ArrowLeft,
	Calendar as CalendarIcon,
	Clock,
	Loader2,
} from 'lucide-react'

interface StepDateTimeProps {
	selectedService: Service
	selectedWorker: Worker | null
	anyWorkerMode: boolean
	selectedDate: Date | undefined
	selectedSlot: TimeSlot | null
	availableSlots: TimeSlot[]
	loadingSlots: boolean
	onSelectDate: (date: Date | undefined) => void
	onSelectSlot: (slot: TimeSlot) => void
	onBack: () => void
}

export function StepDateTime({
	selectedService,
	selectedWorker,
	anyWorkerMode,
	selectedDate,
	selectedSlot,
	availableSlots,
	loadingSlots,
	onSelectDate,
	onSelectSlot,
	onBack,
}: StepDateTimeProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Select Date & Time</h2>
				<Button variant="ghost" size="sm" onClick={onBack}>
					<ArrowLeft className="h-4 w-4 mr-1" />
					Back
				</Button>
			</div>
			<p className="text-sm text-muted-foreground">
				{selectedService.name} with {anyWorkerMode ? 'any available professional' : selectedWorker?.display_name}
			</p>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card className="py-0">
					<CardContent className="p-4">
						<Calendar
							mode="single"
							selected={selectedDate}
							onSelect={onSelectDate}
							disabled={(date) => {
								const today = new Date()
								today.setHours(0, 0, 0, 0)
								return date < today
							}}
							className="rounded-md"
						/>
					</CardContent>
				</Card>

				<div>
					{!selectedDate && (
						<Card>
							<CardContent className="py-12 text-center">
								<CalendarIcon className="h-8 w-8 mx-auto text-muted-foreground/40" />
								<p className="mt-3 text-sm text-muted-foreground">Select a date to see available times</p>
							</CardContent>
						</Card>
					)}
					{selectedDate && loadingSlots && (
						<Card>
							<CardContent className="py-12 text-center">
								<Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" />
								<p className="mt-3 text-sm text-muted-foreground">Loading available times...</p>
							</CardContent>
						</Card>
					)}
					{selectedDate && !loadingSlots && availableSlots.length === 0 && (
						<Card>
							<CardContent className="py-12 text-center">
								<Clock className="h-8 w-8 mx-auto text-muted-foreground/40" />
								<p className="mt-3 text-sm text-muted-foreground">No available times on this date</p>
								<p className="mt-1 text-xs text-muted-foreground">Try selecting a different date</p>
							</CardContent>
						</Card>
					)}
					{selectedDate && !loadingSlots && availableSlots.length > 0 && (
						<div className="space-y-2">
							<p className="text-sm font-medium">
								{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
							</p>
							<div className="grid grid-cols-3 gap-2">
								{availableSlots.map((slot) => (
									<Button
										key={slot.start}
										variant={selectedSlot?.start === slot.start ? 'default' : 'outline'}
										size="sm"
										className="text-xs"
										onClick={() => onSelectSlot(slot)}
									>
										{formatTime(slot.start)}
									</Button>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
