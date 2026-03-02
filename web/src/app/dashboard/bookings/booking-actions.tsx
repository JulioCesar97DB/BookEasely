'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { cancelBooking, getAvailableSlots, rescheduleBooking, submitReview } from '@/lib/booking/actions'
import type { TimeSlot } from '@/lib/booking/time-slots'
import { cn } from '@/lib/utils'
import { CalendarClock, Check, Loader2, Star, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { updateBookingStatus } from './actions'

export function BookingActions({
	bookingId,
	businessId,
	serviceId,
	workerId,
	canConfirm,
	canComplete,
	canCancel,
	canReschedule,
	canReview,
}: {
	bookingId: string
	businessId: string
	serviceId: string
	workerId: string
	canConfirm: boolean
	canComplete: boolean
	canCancel: boolean
	canReschedule: boolean
	canReview: boolean
}) {
	const [pending, startTransition] = useTransition()
	const router = useRouter()

	function handleAction(status: string) {
		startTransition(async () => {
			const result = await updateBookingStatus(bookingId, status)
			if (result.error) {
				toast.error(result.error)
			} else {
				toast.success(`Booking ${status}`)
				router.refresh()
			}
		})
	}

	return (
		<>
			{canConfirm && (
				<Button size="sm" variant="outline" onClick={() => handleAction('confirmed')} disabled={pending}>
					{pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
					Confirm
				</Button>
			)}
			{canComplete && (
				<Button size="sm" variant="outline" onClick={() => handleAction('completed')} disabled={pending}>
					{pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
					Complete
				</Button>
			)}
			{canReschedule && (
				<RescheduleDialog bookingId={bookingId} businessId={businessId} serviceId={serviceId} workerId={workerId} />
			)}
			{canCancel && (
				<CancelDialog bookingId={bookingId} />
			)}
			{canReview && (
				<ReviewDialog bookingId={bookingId} businessId={businessId} />
			)}
		</>
	)
}

function CancelDialog({ bookingId }: { bookingId: string }) {
	const [open, setOpen] = useState(false)
	const [reason, setReason] = useState('')
	const [pending, startTransition] = useTransition()
	const router = useRouter()

	function handleCancel() {
		startTransition(async () => {
			const result = await cancelBooking({ bookingId, reason: reason || undefined })
			if (result.error) {
				toast.error(result.error)
			} else {
				toast.success('Booking cancelled')
				setOpen(false)
				router.refresh()
			}
		})
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
					<X className="h-3 w-3 mr-1" />
					Cancel
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Cancel Booking</DialogTitle>
					<DialogDescription>
						Are you sure you want to cancel this appointment? This action cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<Textarea
					placeholder="Reason for cancellation (optional)"
					value={reason}
					onChange={(e) => setReason(e.target.value)}
					rows={2}
				/>
				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>Keep Booking</Button>
					<Button variant="destructive" onClick={handleCancel} disabled={pending}>
						{pending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
						Cancel Booking
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

function ReviewDialog({ bookingId, businessId }: { bookingId: string; businessId: string }) {
	const [open, setOpen] = useState(false)
	const [rating, setRating] = useState(0)
	const [hoverRating, setHoverRating] = useState(0)
	const [comment, setComment] = useState('')
	const [pending, startTransition] = useTransition()
	const router = useRouter()

	function handleSubmit() {
		if (rating === 0) {
			toast.error('Please select a rating')
			return
		}
		startTransition(async () => {
			const result = await submitReview({
				bookingId,
				businessId,
				rating,
				comment: comment || undefined,
			})
			if (result.error) {
				toast.error(result.error)
			} else {
				toast.success('Review submitted!')
				setOpen(false)
				router.refresh()
			}
		})
	}

	const displayRating = hoverRating || rating

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm" variant="outline">
					<Star className="h-3 w-3 mr-1" />
					Review
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Leave a Review</DialogTitle>
					<DialogDescription>
						Share your experience to help others find great services.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div className="flex items-center justify-center gap-1">
						{[1, 2, 3, 4, 5].map((star) => (
							<button
								key={star}
								type="button"
								onMouseEnter={() => setHoverRating(star)}
								onMouseLeave={() => setHoverRating(0)}
								onClick={() => setRating(star)}
								className="p-1 transition-transform hover:scale-110"
							>
								<Star
									className={cn(
										'h-8 w-8 transition-colors',
										star <= displayRating
											? 'fill-amber-400 text-amber-400'
											: 'text-muted-foreground/30'
									)}
								/>
							</button>
						))}
					</div>
					<Textarea
						placeholder="Tell us about your experience (optional)"
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						rows={3}
					/>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
					<Button onClick={handleSubmit} disabled={pending || rating === 0}>
						{pending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
						Submit Review
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

function formatTime(time: string) {
	const [h, m] = time.split(':').map(Number)
	const ampm = h >= 12 ? 'PM' : 'AM'
	const hour = h % 12 || 12
	return m === 0 ? `${hour}:00 ${ampm}` : `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

function RescheduleDialog({ bookingId, businessId, serviceId, workerId }: { bookingId: string; businessId: string; serviceId: string; workerId: string }) {
	const [open, setOpen] = useState(false)
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
	const [slots, setSlots] = useState<TimeSlot[]>([])
	const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
	const [loadingSlots, setLoadingSlots] = useState(false)
	const [pending, startTransition] = useTransition()
	const router = useRouter()

	async function handleDateSelect(date: Date | undefined) {
		if (!date) return
		setSelectedDate(date)
		setSelectedSlot(null)
		setLoadingSlots(true)

		const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
		const result = await getAvailableSlots({ businessId, serviceId, workerId, date: dateStr })
		setSlots(result.slots)
		setLoadingSlots(false)
	}

	function handleReschedule() {
		if (!selectedDate || !selectedSlot) return
		startTransition(async () => {
			const dateStr = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`
			const result = await rescheduleBooking({
				bookingId,
				workerId,
				date: dateStr,
				startTime: selectedSlot.start,
				endTime: selectedSlot.end,
			})
			if (result.error) {
				toast.error(result.error)
			} else {
				toast.success('Booking rescheduled!')
				setOpen(false)
				router.refresh()
			}
		})
	}

	return (
		<Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setSelectedDate(undefined); setSlots([]); setSelectedSlot(null) } }}>
			<DialogTrigger asChild>
				<Button size="sm" variant="outline">
					<CalendarClock className="h-3 w-3 mr-1" />
					Reschedule
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Reschedule Booking</DialogTitle>
					<DialogDescription>
						Pick a new date and time for your appointment.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<Calendar
						mode="single"
						selected={selectedDate}
						onSelect={handleDateSelect}
						disabled={(date) => {
							const today = new Date()
							today.setHours(0, 0, 0, 0)
							return date < today
						}}
						className="rounded-md mx-auto"
					/>
					{loadingSlots && (
						<div className="text-center py-4">
							<Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
							<p className="mt-2 text-xs text-muted-foreground">Loading times...</p>
						</div>
					)}
					{selectedDate && !loadingSlots && slots.length === 0 && (
						<p className="text-sm text-center text-muted-foreground py-2">No available times on this date</p>
					)}
					{selectedDate && !loadingSlots && slots.length > 0 && (
						<div className="grid grid-cols-3 gap-2">
							{slots.map((slot) => (
								<Button
									key={slot.start}
									variant={selectedSlot?.start === slot.start ? 'default' : 'outline'}
									size="sm"
									className="text-xs"
									onClick={() => setSelectedSlot(slot)}
								>
									{formatTime(slot.start)}
								</Button>
							))}
						</div>
					)}
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
					<Button onClick={handleReschedule} disabled={pending || !selectedSlot}>
						{pending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
						Confirm New Time
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
