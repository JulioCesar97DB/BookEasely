import { AnimatedCard, AnimatedSection } from '@/components/animated-cards'
import { PageTransition } from '@/components/page-transition'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuthProfile, getAuthUser, getIsWorker, getUserRole } from '@/lib/supabase/auth-cache'
import { createClient } from '@/lib/supabase/server'
import { Briefcase, Calendar, ClipboardList, Clock, Heart, Search, Star, Store, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

function getDateStrings() {
	const now = new Date()
	const today = now.toISOString().split('T')[0]!
	const nextWeek = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0]!
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]!
	return { today, nextWeek, monthStart }
}

export default async function DashboardPage() {
	const [user, profile, role, isWorker] = await Promise.all([
		getAuthUser(),
		getAuthProfile(),
		getUserRole(),
		getIsWorker(),
	])

	const userId = user!.id
	const firstName = (profile?.full_name || user?.user_metadata?.full_name || '').split(' ')[0] || 'there'

	if (role === 'business_owner') {
		return <BusinessOwnerDashboard firstName={firstName} userId={userId} />
	}

	if (isWorker) {
		return <WorkerDashboard firstName={firstName} userId={userId} />
	}

	return <ClientDashboard firstName={firstName} userId={userId} />
}

async function BusinessOwnerDashboard({ firstName, userId }: { firstName: string; userId: string }) {
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

async function WorkerDashboard({ firstName, userId }: { firstName: string; userId: string }) {
	const supabase = await createClient()

	const { data: workerRecords } = await supabase
		.from('workers')
		.select('id, display_name, business_id, businesses(name)')
		.eq('user_id', userId)
		.eq('is_active', true)

	const workerIds = workerRecords?.map((w) => w.id) ?? []

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
							value={String(workerRecords?.length ?? 0)}
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

				{workerRecords && workerRecords.length > 0 && (
					<AnimatedSection delay={0.25}>
						<h2 className="text-lg font-semibold mb-4">Your Workplaces</h2>
						<div className="grid gap-3 sm:grid-cols-2">
							{workerRecords.map((record) => {
								const business = record.businesses as unknown as { name: string } | null
								return (
									<Card key={record.id}>
										<CardContent className="flex items-center gap-4 py-4">
											<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
												<Store className="h-5 w-5 text-primary" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-medium truncate">{business?.name ?? 'Business'}</p>
												<p className="text-sm text-muted-foreground truncate">as {record.display_name}</p>
											</div>
											<Badge variant="secondary">Worker</Badge>
										</CardContent>
									</Card>
								)
							})}
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

async function ClientDashboard({ firstName, userId }: { firstName: string; userId: string }) {
	const supabase = await createClient()

	const { today } = getDateStrings()

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

function StatCard({
	title,
	value,
	description,
	icon: Icon,
}: {
	title: string
	value: string
	description: string
	icon: React.ComponentType<{ className?: string }>
}) {
	return (
		<Card>
			<CardContent className="pt-6">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">{title}</p>
						<p className="text-2xl font-bold">{value}</p>
						<p className="text-xs text-muted-foreground">{description}</p>
					</div>
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
						<Icon className="h-5 w-5 text-primary" />
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

function QuickAction({
	href,
	icon: Icon,
	label,
	count,
	countLabel,
}: {
	href: string
	icon: React.ComponentType<{ className?: string }>
	label: string
	count?: number
	countLabel?: string
}) {
	return (
		<Link href={href}>
			<Card className="transition-all hover:shadow-md hover:border-primary/30 cursor-pointer">
				<CardContent className="flex items-center gap-3 py-4">
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
						<Icon className="h-4.5 w-4.5 text-primary" />
					</div>
					<div>
						<p className="text-sm font-medium">{label}</p>
						{count !== undefined && (
							<p className="text-xs text-muted-foreground">{count} {countLabel}</p>
						)}
					</div>
				</CardContent>
			</Card>
		</Link>
	)
}
