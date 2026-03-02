'use client'

import { Button } from '@/components/ui/button'
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
import { cancelBooking, submitReview } from '@/lib/booking/actions'
import { cn } from '@/lib/utils'
import { Check, Loader2, Star, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { updateBookingStatus } from './actions'

export function BookingActions({
	bookingId,
	businessId,
	canConfirm,
	canComplete,
	canCancel,
	canReview,
}: {
	bookingId: string
	businessId: string
	canConfirm: boolean
	canComplete: boolean
	canCancel: boolean
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
