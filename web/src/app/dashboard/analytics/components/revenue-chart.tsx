'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import type { RevenuePeriod } from '../actions'

const chartConfig = {
	revenue: {
		label: 'Revenue',
		color: 'var(--chart-2)',
	},
} satisfies ChartConfig

export function RevenueChart({ data, totalRevenue }: { data: RevenuePeriod[]; totalRevenue: number }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Revenue</CardTitle>
				<CardDescription>
					Weekly revenue from completed bookings — ${totalRevenue.toLocaleString()}
				</CardDescription>
			</CardHeader>
			<CardContent className="px-2 sm:px-6">
				<ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
					<BarChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="week"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							minTickGap={32}
							tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
						/>
						<YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
						<ChartTooltip
							content={
								<ChartTooltipContent
									className="w-[160px]"
									labelFormatter={(value) => `Week of ${new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
									formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
								/>
							}
						/>
						<Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
