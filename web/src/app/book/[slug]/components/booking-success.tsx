'use client'

import { Button } from '@/components/ui/button'
import type { TimeSlot } from '@/lib/booking/time-slots'
import { formatTime } from '@/lib/format'
import type { BusinessWithCategory, Service } from '@/lib/types'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface BookingSuccessProps {
	business: BusinessWithCategory
	selectedService: Service | null
	resolvedWorkerName: string
	selectedDate: Date | undefined
	selectedSlot: TimeSlot | null
}

export function BookingSuccess({
	business,
	selectedService,
	resolvedWorkerName,
	selectedDate,
	selectedSlot,
}: BookingSuccessProps) {
	return (
		<div className="mx-auto max-w-lg px-4 py-16 text-center">
			<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
				<CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
			</div>
			<h1 className="mt-6 text-2xl font-bold">Booking {business.auto_confirm ? 'Confirmed' : 'Requested'}!</h1>
			<p className="mt-2 text-muted-foreground">
				{business.auto_confirm
					? 'Your appointment has been confirmed. You\'ll receive a confirmation soon.'
					: 'Your booking request has been sent. The business will confirm it shortly.'}
			</p>
			<div className="mt-6 rounded-lg border bg-card p-4 text-left text-sm space-y-2">
				<div className="flex justify-between">
					<span className="text-muted-foreground">Business</span>
					<span className="font-medium">{business.name}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">Service</span>
					<span className="font-medium">{selectedService?.name}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">Worker</span>
					<span className="font-medium">{resolvedWorkerName}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">Date</span>
					<span className="font-medium">
						{selectedDate?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
					</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">Time</span>
					<span className="font-medium">
						{selectedSlot && `${formatTime(selectedSlot.start)} - ${formatTime(selectedSlot.end)}`}
					</span>
				</div>
			</div>
			<div className="mt-6 flex gap-3 justify-center">
				<Button asChild variant="outline">
					<Link href={`/business/${business.slug}`}>Back to Business</Link>
				</Button>
				<Button asChild>
					<Link href="/dashboard/bookings">View My Bookings</Link>
				</Button>
			</div>
		</div>
	)
}
