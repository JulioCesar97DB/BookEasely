'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { BOOKING_STATUS_COLORS, SCHEDULE_CHART_COLORS } from '@/lib/constants'
import { formatTime, formatDuration, getInitials } from '@/lib/format'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { Calendar, Check, Clock, DollarSign, MessageSquare, Phone, X } from 'lucide-react'
import { useTransition } from 'react'
import { updateBookingStatus } from '@/app/dashboard/bookings/actions'
import { toast } from 'sonner'
import type { CalendarBooking } from '../calendar-client'

interface BookingDetailPanelProps {
	booking: CalendarBooking | null
	onClose: () => void
	onAction: () => void
	workerColorMap: Map<string, number>
}

export function BookingDetailPanel({ booking, onClose, onAction, workerColorMap }: BookingDetailPanelProps) {
	const [isPending, startTransition] = useTransition()

	const handleStatusUpdate = (status: 'confirmed' | 'completed' | 'cancelled') => {
		if (!booking) return
		startTransition(async () => {
			const result = await updateBookingStatus(booking.id, status)
			if (result.error) {
				toast.error(result.error)
			} else {
				toast.success(
					status === 'confirmed' ? 'Booking confirmed' :
					status === 'completed' ? 'Booking completed' :
					'Booking cancelled'
				)
				onAction()
			}
		})
	}

	const clientName = booking?.profiles?.full_name ?? 'Unknown Client'
	const serviceName = booking?.services?.name ?? 'Service'
	const servicePrice = booking?.services ? Number(booking.services.price) : 0
	const serviceDuration = booking?.services?.duration_minutes ?? 0
	const workerName = booking?.workers?.display_name ?? 'Unassigned'
	const workerColorIndex = booking ? (workerColorMap.get(booking.worker_id) ?? 0) : 0
	const phone = booking?.profiles?.phone ?? ''

	const canConfirm = booking?.status === 'pending'
	const canComplete = booking?.status === 'confirmed'
	const canCancel = booking?.status === 'pending' || booking?.status === 'confirmed'

	return (
		<Sheet open={!!booking} onOpenChange={(open) => !open && onClose()}>
			<SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col">
				{booking && (
					<>
						{/* Header with status */}
						<SheetHeader className="px-6 pt-6 pb-4 space-y-3">
							<div className="flex items-center justify-between">
								<SheetTitle className="text-lg">Booking Details</SheetTitle>
								<Badge className={cn('capitalize', BOOKING_STATUS_COLORS[booking.status])}>
									{booking.status}
								</Badge>
							</div>
						</SheetHeader>

						<Separator />

						{/* Content */}
						<div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
							{/* Client */}
							<div className="flex items-center gap-3">
								<div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
									{getInitials(clientName)}
								</div>
								<div className="min-w-0">
									<p className="font-semibold text-sm truncate">{clientName}</p>
									{phone && (
										<p className="text-xs text-muted-foreground flex items-center gap-1">
											<Phone className="h-3 w-3" />
											{phone}
										</p>
									)}
								</div>
							</div>

							<Separator />

							{/* Service */}
							<DetailRow icon={<Clock className="h-4 w-4" />} label="Service">
								<p className="text-sm font-medium">{serviceName}</p>
								<p className="text-xs text-muted-foreground">
									{formatDuration(serviceDuration)} · ${servicePrice.toFixed(2)}
								</p>
							</DetailRow>

							{/* Worker */}
							<DetailRow
								icon={
									<span className={cn(
										'flex h-4 w-4 rounded-full',
										SCHEDULE_CHART_COLORS[workerColorIndex % SCHEDULE_CHART_COLORS.length].bg
									)} />
								}
								label="Worker"
							>
								<p className="text-sm font-medium">{workerName}</p>
							</DetailRow>

							{/* Date & Time */}
							<DetailRow icon={<Calendar className="h-4 w-4" />} label="Date & Time">
								<p className="text-sm font-medium">
									{format(parseISO(booking.date), 'EEEE, MMMM d, yyyy')}
								</p>
								<p className="text-xs text-muted-foreground">
									{formatTime(booking.start_time)} – {formatTime(booking.end_time)}
								</p>
							</DetailRow>

							{/* Price */}
							<DetailRow icon={<DollarSign className="h-4 w-4" />} label="Price">
								<p className="text-sm font-semibold">${servicePrice.toFixed(2)}</p>
							</DetailRow>

							{/* Notes */}
							{booking.note && (
								<DetailRow icon={<MessageSquare className="h-4 w-4" />} label="Notes">
									<p className="text-sm text-muted-foreground">{booking.note}</p>
								</DetailRow>
							)}

							{/* Cancellation reason */}
							{booking.status === 'cancelled' && booking.cancellation_reason && (
								<div className="rounded-lg border border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20 p-3">
									<p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Cancellation Reason</p>
									<p className="text-sm text-red-600 dark:text-red-300">{booking.cancellation_reason}</p>
								</div>
							)}
						</div>

						{/* Actions */}
						{(canConfirm || canComplete || canCancel) && (
							<>
								<Separator />
								<div className="p-4 flex items-center gap-2">
									{canConfirm && (
										<Button
											onClick={() => handleStatusUpdate('confirmed')}
											disabled={isPending}
											className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
										>
											<Check className="mr-1.5 h-4 w-4" />
											Confirm
										</Button>
									)}
									{canComplete && (
										<Button
											onClick={() => handleStatusUpdate('completed')}
											disabled={isPending}
											className="flex-1 bg-green-600 hover:bg-green-700 text-white"
										>
											<Check className="mr-1.5 h-4 w-4" />
											Complete
										</Button>
									)}
									{canCancel && (
										<Button
											variant="outline"
											onClick={() => handleStatusUpdate('cancelled')}
											disabled={isPending}
											className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20"
										>
											<X className="mr-1.5 h-4 w-4" />
											Cancel
										</Button>
									)}
								</div>
							</>
						)}
					</>
				)}
			</SheetContent>
		</Sheet>
	)
}

function DetailRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
	return (
		<div className="flex gap-3">
			<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
				{icon}
			</div>
			<div className="min-w-0">
				<p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
				{children}
			</div>
		</div>
	)
}
