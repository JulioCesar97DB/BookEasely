import { PageTransition } from '@/components/page-transition'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BOOKING_STATUS_COLORS } from '@/lib/constants'
import { getAuthUser, getIsWorker } from '@/lib/supabase/auth-cache'
import { createClient } from '@/lib/supabase/server'
import { Calendar, Clock } from 'lucide-react'
import Link from 'next/link'
import { BookingActions } from './booking-actions'

interface BookingRow {
	id: string
	date: string
	start_time: string
	end_time: string
	status: string
	note: string | null
	business_id: string
	service_id: string
	worker_id: string
	services: { name: string; duration_minutes: number; price: number } | null
	businesses: { name: string; slug: string } | null
	profiles: { full_name: string } | null
	workers: { display_name: string } | null
	reviews: { id: string }[]
}


export default async function BookingsPage() {
	const [user, isWorker] = await Promise.all([getAuthUser(), getIsWorker()])
	const userId = user!.id
	const supabase = await createClient()

	let workerIds: string[] = []
	if (isWorker) {
		const { data: workerRecords } = await supabase
			.from('workers')
			.select('id')
			.eq('user_id', userId)
			.eq('is_active', true)
		workerIds = workerRecords?.map((w) => w.id) ?? []
	}

	const [{ data: rawClientBookings }, workerBookingsResult] = await Promise.all([
		supabase
			.from('bookings')
			.select('id, date, start_time, end_time, status, note, business_id, service_id, worker_id, services(name, duration_minutes, price), businesses(name, slug), workers(display_name), reviews(id)')
			.eq('client_id', userId)
			.order('date', { ascending: false })
			.limit(50),
		workerIds.length > 0
			? supabase
				.from('bookings')
				.select('id, date, start_time, end_time, status, note, business_id, service_id, worker_id, services(name, duration_minutes, price), profiles!bookings_client_id_fkey(full_name), reviews(id)')
				.in('worker_id', workerIds)
				.order('date', { ascending: false })
				.limit(50)
			: Promise.resolve({ data: [] }),
	])

	// Supabase join queries return complex inferred types; cast via unknown for safety
	const clientBookings = (rawClientBookings ?? []) as unknown as BookingRow[]
	const workerBookings = (workerBookingsResult.data ?? []) as unknown as BookingRow[]
	const today = new Date().toISOString().split('T')[0]!

	return (
		<PageTransition>
			<div className="space-y-8">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
					<p className="mt-1 text-muted-foreground">
						Manage your upcoming and past appointments
					</p>
				</div>

				{isWorker && (
					<div className="space-y-4">
						<h2 className="text-lg font-semibold">Work Appointments</h2>
						{workerBookings.length === 0 ? (
							<Card>
								<CardContent className="flex flex-col items-center justify-center py-12 text-center">
									<Calendar className="h-10 w-10 text-muted-foreground/30" />
									<p className="mt-3 text-sm font-medium text-muted-foreground">No work appointments yet</p>
								</CardContent>
							</Card>
						) : (
							<div className="space-y-3">
								{workerBookings.map((booking) => (
									<BookingCard
										key={booking.id}
										booking={booking}
										label={booking.profiles?.full_name ?? 'Client'}
										sublabel={booking.services?.name ?? 'Service'}
										isWorkerView
										isPast={booking.date < today}
									/>
								))}
							</div>
						)}
					</div>
				)}

				<div className="space-y-4">
					<h2 className="text-lg font-semibold">{isWorker ? 'Personal Bookings' : 'My Bookings'}</h2>
					{clientBookings.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-12 text-center">
								<Calendar className="h-10 w-10 text-muted-foreground/30" />
								<p className="mt-3 text-sm font-medium text-muted-foreground">No bookings yet</p>
								<p className="mt-1 text-xs text-muted-foreground/70">
									When you book an appointment, it will appear here
								</p>
								<Button asChild variant="outline" className="mt-4">
									<Link href="/dashboard/discover">Browse Businesses</Link>
								</Button>
							</CardContent>
						</Card>
					) : (
						<div className="space-y-3">
							{clientBookings.map((booking) => (
								<BookingCard
									key={booking.id}
									booking={booking}
									label={booking.businesses?.name ?? 'Business'}
									sublabel={`${booking.services?.name ?? 'Service'}${booking.workers?.display_name ? ` with ${booking.workers.display_name}` : ''}`}
									isWorkerView={false}
									isPast={booking.date < today}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</PageTransition>
	)
}

function BookingCard({
	booking,
	label,
	sublabel,
	isWorkerView,
	isPast,
}: {
	booking: BookingRow
	label: string
	sublabel: string
	isWorkerView: boolean
	isPast: boolean
}) {
	const canConfirm = isWorkerView && booking.status === 'pending'
	const canComplete = isWorkerView && booking.status === 'confirmed'
	const canReschedule = !isWorkerView && (booking.status === 'pending' || booking.status === 'confirmed') && !isPast
	const canCancel = !isWorkerView && (booking.status === 'pending' || booking.status === 'confirmed') && !isPast
	const canReview = !isWorkerView && booking.status === 'completed' && (!booking.reviews || booking.reviews.length === 0)

	return (
		<Card className={isPast ? 'opacity-60' : ''}>
			<CardContent className="flex flex-wrap items-center gap-3 py-4 sm:gap-4">
				<div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
					<span className="text-xs font-medium leading-none">
						{new Date(booking.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
					</span>
					<span className="text-lg font-bold leading-none mt-0.5">
						{new Date(booking.date + 'T00:00:00').getDate()}
					</span>
				</div>
				<div className="flex-1 min-w-0">
					<p className="font-medium truncate">{label}</p>
					<p className="text-sm text-muted-foreground truncate">{sublabel}</p>
					<div className="flex items-center gap-2 mt-1">
						<Clock className="h-3 w-3 text-muted-foreground" />
						<span className="text-xs text-muted-foreground">
							{booking.start_time.slice(0, 5)} – {booking.end_time.slice(0, 5)}
						</span>
						{booking.services?.price && (
							<span className="text-xs font-medium">${Number(booking.services.price).toFixed(0)}</span>
						)}
					</div>
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					<BookingActions
						bookingId={booking.id}
						businessId={booking.business_id}
						serviceId={booking.service_id}
						workerId={booking.worker_id}
						canConfirm={canConfirm}
						canComplete={canComplete}
						canCancel={canCancel}
						canReschedule={canReschedule}
						canReview={canReview}
					/>
					<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${BOOKING_STATUS_COLORS[booking.status] ?? ''}`}>
						{booking.status}
					</span>
				</div>
			</CardContent>
		</Card>
	)
}
