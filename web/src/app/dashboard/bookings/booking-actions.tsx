'use client'

import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { updateBookingStatus } from './actions'

export function BookingActions({
	bookingId,
	canConfirm,
	canComplete,
}: {
	bookingId: string
	canConfirm: boolean
	canComplete: boolean
}) {
	const [pending, startTransition] = useTransition()

	function handleAction(status: string) {
		startTransition(async () => {
			const result = await updateBookingStatus(bookingId, status)
			if (result.error) {
				toast.error(result.error)
			} else {
				toast.success(`Booking ${status}`)
			}
		})
	}

	if (canConfirm) {
		return (
			<Button size="sm" variant="outline" onClick={() => handleAction('confirmed')} disabled={pending}>
				{pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
				Confirm
			</Button>
		)
	}

	if (canComplete) {
		return (
			<Button size="sm" variant="outline" onClick={() => handleAction('completed')} disabled={pending}>
				{pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
				Complete
			</Button>
		)
	}

	return null
}
