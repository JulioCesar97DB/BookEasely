import { AnimatedCard, AnimatedSection } from '@/components/animated-cards'
import { PageTransition } from '@/components/page-transition'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { Calendar, Clock, ClipboardList, Star, Store, TrendingUp, Users } from 'lucide-react'
import { QuickAction } from './quick-action'
import { StatCard } from './stat-card'

function getDateStrings() {
	const now = new Date()
	const today = now.toISOString().split('T')[0]!
	const nextWeek = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0]!
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]!
	return { today, nextWeek, monthStart }
}

export async function BusinessOwnerDashboard({ firstName, userId }: { firstName: string; userId: string }) {
	const supabase = await createClient()

	const { data: business } = await supabase
		.from('businesses')
		.select('id, rating_avg, rating_count')
		.eq('owner_id', userId)
		.single()

	const businessId = business?.id

	const { today, nextWeek, monthStart } = getDateStrings()

	const [todayBookings, upcomingBookings, monthBookings, servicesCount, workersCount] = await Promise.all([
		businessId
			? supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('business_id', businessId).eq('date', today)
			: Promise.resolve({ count: 0 }),
		businessId
			? supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('business_id', businessId).gte('date', today).lte('date', nextWeek)
			: Promise.resolve({ count: 0 }),
		businessId
			? supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('business_id', businessId).gte('date', monthStart)
			: Promise.resolve({ count: 0 }),
		businessId
			? supabase.from('services').select('id', { count: 'exact', head: true }).eq('business_id', businessId).eq('is_active', true)
			: Promise.resolve({ count: 0 }),
		businessId
			? supabase.from('workers').select('id', { count: 'exact', head: true }).eq('business_id', businessId).eq('is_active', true)
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
						Here&apos;s an overview of your business
					</p>
				</div>

				{/* Stats */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<AnimatedCard delay={0}>
						<StatCard
							title="Today's Bookings"
							value={String(todayBookings.count ?? 0)}
							description={todayBookings.count === 0 ? 'No bookings today' : 'Scheduled today'}
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
							title="Rating"
							value={business?.rating_count ? business.rating_avg.toFixed(1) : '--'}
							description={business?.rating_count ? `${business.rating_count} review${business.rating_count !== 1 ? 's' : ''}` : 'No reviews yet'}
							icon={Star}
						/>
					</AnimatedCard>
					<AnimatedCard delay={0.15}>
						<StatCard
							title="This Month"
							value={String(monthBookings.count ?? 0)}
							description="Total bookings"
							icon={TrendingUp}
						/>
					</AnimatedCard>
				</div>

				{/* Quick Actions */}
				<AnimatedSection delay={0.2}>
					<h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						<QuickAction href="/dashboard/services" icon={ClipboardList} label="Services" count={servicesCount.count ?? 0} countLabel="active" />
						<QuickAction href="/dashboard/workers" icon={Users} label="Team" count={workersCount.count ?? 0} countLabel="active" />
						<QuickAction href="/dashboard/schedule" icon={Clock} label="Schedule" />
						<QuickAction href="/dashboard/business" icon={Store} label="Business Profile" />
					</div>
				</AnimatedSection>

				{/* Recent Activity */}
				<AnimatedSection delay={0.3}>
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Recent Activity</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<Calendar className="h-12 w-12 text-muted-foreground/30" />
								<p className="mt-4 text-sm font-medium text-muted-foreground">No recent activity</p>
								<p className="mt-1 text-xs text-muted-foreground/70">
									Bookings and updates will appear here
								</p>
							</div>
						</CardContent>
					</Card>
				</AnimatedSection>
			</div>
		</PageTransition>
	)
}
