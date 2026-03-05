'use client'

import dynamic from 'next/dynamic'
import { AnimatedCard, AnimatedSection } from '@/components/animated-cards'
import { PageTransition } from '@/components/page-transition'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3, DollarSign, TrendingUp } from 'lucide-react'
import type { AnalyticsData } from './actions'

// Dynamic imports — recharts is ~45KB gzipped, defer until needed
const ChartSkeleton = () => (
	<Card className="p-6"><Skeleton className="h-[250px] w-full" /></Card>
)

const BookingsTrendChart = dynamic(
	() => import('./components/bookings-trend-chart').then((m) => ({ default: m.BookingsTrendChart })),
	{ loading: ChartSkeleton }
)
const RevenueChart = dynamic(
	() => import('./components/revenue-chart').then((m) => ({ default: m.RevenueChart })),
	{ loading: ChartSkeleton }
)
const PopularServicesChart = dynamic(
	() => import('./components/popular-services-chart').then((m) => ({ default: m.PopularServicesChart })),
	{ loading: ChartSkeleton }
)
const StatusBreakdownChart = dynamic(
	() => import('./components/status-breakdown-chart').then((m) => ({ default: m.StatusBreakdownChart })),
	{ loading: ChartSkeleton }
)
const WorkerUtilizationChart = dynamic(
	() => import('./components/worker-utilization-chart').then((m) => ({ default: m.WorkerUtilizationChart })),
	{ loading: ChartSkeleton }
)

function StatCard({ title, value, description, icon: Icon }: {
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

export function AnalyticsClient({ data, businessName }: { data: AnalyticsData; businessName: string }) {
	return (
		<PageTransition>
			<div className="space-y-8">
				<div>
					<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Analytics</h1>
					<p className="mt-1 text-muted-foreground">{businessName} — Last 90 days</p>
				</div>

				{/* Summary stats */}
				<div className="grid gap-4 sm:grid-cols-3">
					<AnimatedCard delay={0}>
						<StatCard
							title="Total Bookings"
							value={String(data.totalBookings)}
							description="Last 90 days"
							icon={BarChart3}
						/>
					</AnimatedCard>
					<AnimatedCard delay={0.05}>
						<StatCard
							title="Revenue"
							value={`$${data.totalRevenue.toLocaleString()}`}
							description="From completed bookings"
							icon={DollarSign}
						/>
					</AnimatedCard>
					<AnimatedCard delay={0.1}>
						<StatCard
							title="Completion Rate"
							value={`${data.completionRate}%`}
							description="Bookings completed"
							icon={TrendingUp}
						/>
					</AnimatedCard>
				</div>

				{/* Bookings trend — full width */}
				<AnimatedSection delay={0.15}>
					<BookingsTrendChart data={data.bookingTrend} />
				</AnimatedSection>

				{/* Revenue + Status breakdown */}
				<div className="grid gap-4 lg:grid-cols-2">
					<AnimatedSection delay={0.2}>
						<RevenueChart data={data.revenue} totalRevenue={data.totalRevenue} />
					</AnimatedSection>
					<AnimatedSection delay={0.25}>
						<StatusBreakdownChart data={data.statusBreakdown} />
					</AnimatedSection>
				</div>

				{/* Popular services + Worker utilization */}
				<div className="grid gap-4 lg:grid-cols-2">
					<AnimatedSection delay={0.3}>
						<PopularServicesChart data={data.popularServices} />
					</AnimatedSection>
					<AnimatedSection delay={0.35}>
						<WorkerUtilizationChart data={data.workerUtilization} />
					</AnimatedSection>
				</div>
			</div>
		</PageTransition>
	)
}
