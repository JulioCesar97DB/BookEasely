import { AnimatedCard, AnimatedSection } from '@/components/animated-cards'
import { PageTransition } from '@/components/page-transition'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { type WorkerWithBusiness, typedQuery } from '@/lib/types'
import { Briefcase, Calendar, Clock, Search, Store } from 'lucide-react'
import { QuickAction } from './quick-action'
import { StatCard } from './stat-card'

function getDateStrings() {
	const now = new Date()
	const today = now.toISOString().split('T')[0]!
	const nextWeek = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0]!
	return { today, nextWeek }
}

export async function WorkerDashboard({ firstName, userId }: { firstName: string; userId: string }) {
	const supabase = await createClient()

	const { data: rawWorkerRecords } = await supabase
		.from('workers')
		.select('id, display_name, business_id, businesses(name)')
		.eq('user_id', userId)
		.eq('is_active', true)

	const workerRecords = typedQuery<WorkerWithBusiness[]>(rawWorkerRecords ?? [])
	const workerIds = workerRecords.map((w) => w.id)

	const { today, nextWeek } = getDateStrings()

	const [todayBookings, upcomingBookings] = await Promise.all([
		workerIds.length > 0
			? supabase.from('bookings').select('id', { count: 'exact', head: true }).in('worker_id', workerIds).eq('date', today).in('status', ['pending', 'confirmed'])
			: Promise.resolve({ count: 0 }),
		workerIds.length > 0
			? supabase.from('bookings').select('id', { count: 'exact', head: true }).in('worker_id', workerIds).gte('date', today).lte('date', nextWeek).in('status', ['pending', 'confirmed'])
			: Promise.resolve({ count: 0 }),
	])

	return (
		<PageTransition>
			<div className="space-y-8">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Welcome back, {firstName}
					</h1>
					<p className="mt-1 text-muted-foreground">
						Here&apos;s your work overview
					</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<AnimatedCard delay={0}>
						<StatCard
							title="Today"
							value={String(todayBookings.count ?? 0)}
							description={todayBookings.count === 0 ? 'No appointments today' : 'Appointments today'}
							icon={Calendar}
						/>
					</AnimatedCard>
					<AnimatedCard delay={0.05}>
						<StatCard
							title="Upcoming"
							value={String(upcomingBookings.count ?? 0)}
							description="Next 7 days"
							icon={Clock}
						/>
					</AnimatedCard>
					<AnimatedCard delay={0.1}>
						<StatCard
							title="Businesses"
							value={String(workerRecords.length)}
							description="You work for"
							icon={Briefcase}
						/>
					</AnimatedCard>
				</div>

				<AnimatedSection delay={0.15}>
					<h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						<QuickAction href="/dashboard/my-schedule" icon={Clock} label="My Schedule" />
						<QuickAction href="/dashboard/bookings" icon={Calendar} label="My Bookings" />
						<QuickAction href="/dashboard/discover" icon={Search} label="Discover Services" />
					</div>
				</AnimatedSection>

				{workerRecords.length > 0 && (
					<AnimatedSection delay={0.25}>
						<h2 className="text-lg font-semibold mb-4">Your Workplaces</h2>
						<div className="grid gap-3 sm:grid-cols-2">
							{workerRecords.map((record) => (
									<Card key={record.id}>
										<CardContent className="flex items-center gap-4 py-4">
											<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
												<Store className="h-5 w-5 text-primary" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-medium truncate">{record.businesses?.name ?? 'Business'}</p>
												<p className="text-sm text-muted-foreground truncate">as {record.display_name}</p>
											</div>
											<Badge variant="secondary">Worker</Badge>
										</CardContent>
									</Card>
							))}
						</div>
					</AnimatedSection>
				)}

				<AnimatedSection delay={0.35}>
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Recent Activity</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<Calendar className="h-12 w-12 text-muted-foreground/30" />
								<p className="mt-4 text-sm font-medium text-muted-foreground">No recent activity</p>
								<p className="mt-1 text-xs text-muted-foreground/70">
									Your work appointments and updates will appear here
								</p>
							</div>
						</CardContent>
					</Card>
				</AnimatedSection>
			</div>
		</PageTransition>
	)
}
