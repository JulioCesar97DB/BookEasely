import { AnimatedCard, AnimatedSection } from '@/components/animated-cards'
import { PageTransition } from '@/components/page-transition'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { Calendar, Clock, Heart, Search } from 'lucide-react'
import { QuickAction } from './quick-action'
import { StatCard } from './stat-card'

export async function ClientDashboard({ firstName, userId }: { firstName: string; userId: string }) {
	const supabase = await createClient()

	const today = new Date().toISOString().split('T')[0]!

	const [upcomingBookings, completedBookings, favoritesCount] = await Promise.all([
		supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('client_id', userId).gte('date', today).in('status', ['pending', 'confirmed']),
		supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('client_id', userId).eq('status', 'completed'),
		supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('client_id', userId),
	])

	return (
		<PageTransition>
			<div className="space-y-8">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Welcome back, {firstName}
					</h1>
					<p className="mt-1 text-muted-foreground">
						Here&apos;s what&apos;s coming up
					</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<AnimatedCard delay={0}>
						<StatCard
							title="Upcoming"
							value={String(upcomingBookings.count ?? 0)}
							description={upcomingBookings.count === 0 ? 'No upcoming bookings' : 'Scheduled'}
							icon={Calendar}
						/>
					</AnimatedCard>
					<AnimatedCard delay={0.05}>
						<StatCard
							title="Completed"
							value={String(completedBookings.count ?? 0)}
							description="Total visits"
							icon={Clock}
						/>
					</AnimatedCard>
					<AnimatedCard delay={0.1}>
						<StatCard
							title="Favorites"
							value={String(favoritesCount.count ?? 0)}
							description="Saved businesses"
							icon={Heart}
						/>
					</AnimatedCard>
				</div>

				<AnimatedSection delay={0.15}>
					<h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						<QuickAction href="/dashboard/discover" icon={Search} label="Discover Services" />
						<QuickAction href="/dashboard/bookings" icon={Calendar} label="My Bookings" />
						<QuickAction href="/dashboard/favorites" icon={Heart} label="Favorites" />
					</div>
				</AnimatedSection>

				<AnimatedSection delay={0.25}>
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Recent Activity</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<Calendar className="h-12 w-12 text-muted-foreground/30" />
								<p className="mt-4 text-sm font-medium text-muted-foreground">No recent activity</p>
								<p className="mt-1 text-xs text-muted-foreground/70">
									Your bookings and reviews will appear here
								</p>
							</div>
						</CardContent>
					</Card>
				</AnimatedSection>
			</div>
		</PageTransition>
	)
}
