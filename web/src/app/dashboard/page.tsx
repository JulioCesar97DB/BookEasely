import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/types'
import { Calendar, Clock, Star, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()

	const { data: profile } = await supabase
		.from('profiles')
		.select('full_name, role')
		.eq('id', user!.id)
		.single()

	const role = (profile?.role ?? user!.user_metadata?.role ?? 'client') as UserRole
	const firstName = (profile?.full_name || user!.user_metadata?.full_name || '').split(' ')[0] || 'there'

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					Welcome back, {firstName}
				</h1>
				<p className="mt-1 text-muted-foreground">
					{role === 'business_owner'
						? 'Here\'s an overview of your business'
						: 'Here\'s what\'s coming up'}
				</p>
			</div>

			{role === 'business_owner' ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<StatCard
						title="Today's Bookings"
						value="0"
						description="No bookings yet"
						icon={Calendar}
					/>
					<StatCard
						title="Upcoming"
						value="0"
						description="Next 7 days"
						icon={Clock}
					/>
					<StatCard
						title="Rating"
						value="--"
						description="No reviews yet"
						icon={Star}
					/>
					<StatCard
						title="This Month"
						value="0"
						description="Total bookings"
						icon={TrendingUp}
					/>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<StatCard
						title="Upcoming"
						value="0"
						description="No upcoming bookings"
						icon={Calendar}
					/>
					<StatCard
						title="Completed"
						value="0"
						description="Total visits"
						icon={Clock}
					/>
					<StatCard
						title="Favorites"
						value="0"
						description="Saved businesses"
						icon={Star}
					/>
				</div>
			)}

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Recent Activity</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<Calendar className="h-12 w-12 text-muted-foreground/30" />
						<p className="mt-4 text-sm font-medium text-muted-foreground">No recent activity</p>
						<p className="mt-1 text-xs text-muted-foreground/70">
							{role === 'business_owner'
								? 'Bookings and updates will appear here'
								: 'Your bookings and reviews will appear here'}
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
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
