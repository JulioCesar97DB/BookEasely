'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import type { TimeSlot } from '@/lib/booking/time-slots'
import { formatDuration, formatTime, getInitials } from '@/lib/format'
import type { BusinessWithCategory, Service, Worker } from '@/lib/types'
import { ArrowLeft, Loader2, Shuffle } from 'lucide-react'

interface StepConfirmProps {
	business: BusinessWithCategory
	selectedService: Service
	selectedWorker: Worker | null
	anyWorkerMode: boolean
	resolvedWorkerName: string
	selectedDate: Date
	selectedSlot: TimeSlot
	note: string
	isPending: boolean
	onNoteChange: (note: string) => void
	onConfirm: () => void
	onBack: () => void
}

export function StepConfirm({
	business,
	selectedService,
	selectedWorker,
	anyWorkerMode,
	resolvedWorkerName,
	selectedDate,
	selectedSlot,
	note,
	isPending,
	onNoteChange,
	onConfirm,
	onBack,
}: StepConfirmProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Confirm Booking</h2>
				<Button variant="ghost" size="sm" onClick={onBack}>
					<ArrowLeft className="h-4 w-4 mr-1" />
					Back
				</Button>
			</div>

			<Card className="py-0">
				<CardContent className="p-5 space-y-4">
					<div className="space-y-3">
						<div className="flex justify-between items-center">
							<span className="text-sm text-muted-foreground">Business</span>
							<span className="text-sm font-medium">{business.name}</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-muted-foreground">Service</span>
							<span className="text-sm font-medium">{selectedService.name}</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-muted-foreground">Professional</span>
							<div className="flex items-center gap-2">
								{selectedWorker ? (
									<Avatar className="h-5 w-5">
										<AvatarImage src={selectedWorker.avatar_url ?? undefined} />
										<AvatarFallback className="text-[8px]">{getInitials(selectedWorker.display_name)}</AvatarFallback>
									</Avatar>
								) : (
									<div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
										<Shuffle className="h-3 w-3 text-primary" />
									</div>
								)}
								<span className="text-sm font-medium">{resolvedWorkerName}</span>
							</div>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-muted-foreground">Date</span>
							<span className="text-sm font-medium">
								{selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-muted-foreground">Time</span>
							<span className="text-sm font-medium">
								{formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-muted-foreground">Duration</span>
							<span className="text-sm font-medium">{formatDuration(selectedService.duration_minutes)}</span>
						</div>
						<div className="flex justify-between items-center border-t pt-3">
							<span className="text-sm font-medium">Total</span>
							<span className="text-lg font-bold">${Number(selectedService.price).toFixed(2)}</span>
						</div>
					</div>
				</CardContent>
			</Card>

			<div>
				<label className="text-sm font-medium">Note (optional)</label>
				<Textarea
					placeholder="Any special requests or notes for the appointment..."
					value={note}
					onChange={(e) => onNoteChange(e.target.value)}
					className="mt-1.5"
					rows={3}
				/>
			</div>

			{business.cancellation_policy && (
				<p className="text-xs text-muted-foreground">
					Cancellation policy: {business.cancellation_policy}.
					{business.cancellation_hours > 0 && ` Cancel at least ${business.cancellation_hours}h in advance.`}
				</p>
			)}

			<Button
				className="w-full"
				size="lg"
				onClick={onConfirm}
				disabled={isPending}
			>
				{isPending ? (
					<>
						<Loader2 className="h-4 w-4 animate-spin mr-2" />
						Booking...
					</>
				) : (
					`Confirm Booking - $${Number(selectedService.price).toFixed(0)}`
				)}
			</Button>
		</div>
	)
}
