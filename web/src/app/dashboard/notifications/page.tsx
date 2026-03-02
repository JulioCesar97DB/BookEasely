import { PageTransition } from '@/components/page-transition'
import { Card, CardContent } from '@/components/ui/card'
import { getAuthUser } from '@/lib/supabase/auth-cache'
import { createClient } from '@/lib/supabase/server'
import { Bell } from 'lucide-react'
import { NotificationsList } from './notifications-list'

export default async function NotificationsPage() {
	const user = await getAuthUser()
	const supabase = await createClient()

	const { data: notifications } = await supabase
		.from('notifications')
		.select('*')
		.eq('user_id', user!.id)
		.order('created_at', { ascending: false })
		.limit(50)

	return (
		<PageTransition>
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
					<p className="mt-1 text-muted-foreground">
						Stay updated on your bookings and activity
					</p>
				</div>

				{(!notifications || notifications.length === 0) ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-16 text-center">
							<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
								<Bell className="h-7 w-7 text-primary" />
							</div>
							<h3 className="mt-4 font-semibold">No notifications</h3>
							<p className="mt-1 max-w-sm text-sm text-muted-foreground">
								You&apos;ll see booking confirmations, reminders, and other updates here.
							</p>
						</CardContent>
					</Card>
				) : (
					<NotificationsList notifications={notifications} />
				)}
			</div>
		</PageTransition>
	)
}
