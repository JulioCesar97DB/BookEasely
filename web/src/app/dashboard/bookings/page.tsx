import { PageTransition } from '@/components/page-transition'
import { Card, CardContent } from '@/components/ui/card'
import { getAuthUser, getIsWorker } from '@/lib/supabase/auth-cache'
import { createClient } from '@/lib/supabase/server'
import { Calendar, Clock } from 'lucide-react'
import { BookingActions } from './booking-actions'

interface BookingRow {
	id: string
	date: string
	start_time: string
	end_time: string
	status: string
	note: string | null
	services: { name: string; duration_minutes: number; price: number } | null
	businesses: { name: string } | null
	profiles: { full_name: string } | null
}

const STATUS_COLORS: Record<string, string> = {
	pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
	confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
	completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
	cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
	no_show: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

export default async function BookingsPage() {
	const [user, isWorker] = await Promise.all([getAuthUser(), getIsWorker()])
	const userId = user!.id
	const supabase = await createClient()

	// Get worker IDs if user is a worker
	let workerIds: string[] = []
	if (isWorker) {
		const { data: workerRecords } = await supabase
			.from('workers')
			.select('id')
			.eq('user_id', userId)
			.eq('is_active', true)
		workerIds = workerRecords?.map((w) => w.id) ?? []
	}

	// Fetch client bookings and worker bookings in parallel
	const [{ data: rawClientBookings }, workerBookingsResult] = await Promise.all([
		supabase
			.from('bookings')
			.select('id, date, start_time, end_time, status, note, services(name, duration_minutes, price), businesses(name)')
			.eq('client_id', userId)
			.order('date', { ascending: false })
			.limit(50),
		workerIds.length > 0
			? supabase
				.from('bookings')
				.select('id, date, start_time, end_time, status, note, services(name, duration_minutes, price), profiles!bookings_client_id_fkey(full_name)')
				.in('worker_id', workerIds)
				.order('date', { ascending: false })
				.limit(50)
			: Promise.resolve({ data: [] }),
	])

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
									<p className="mt-1 text-xs text-muted-foreground/70">
										Appointments assigned to you will appear here
									</p>
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
							</CardContent>
						</Card>
					) : (
						<div className="space-y-3">
							{clientBookings.map((booking) => (
								<BookingCard
									key={booking.id}
									booking={booking}
									label={booking.businesses?.name ?? 'Business'}
									sublabel={booking.services?.name ?? 'Service'}
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
					</div>
				</div>
				<div className="flex items-center gap-2">
					{(canConfirm || canComplete) && (
						<BookingActions
							bookingId={booking.id}
							canConfirm={canConfirm}
							canComplete={canComplete}
						/>
					)}
					<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[booking.status] ?? ''}`}>
						{booking.status}
					</span>
				</div>
			</CardContent>
		</Card>
	)
}
