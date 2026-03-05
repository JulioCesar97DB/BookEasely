'use client'

import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { BookingTrendPoint } from '../actions'

const chartConfig = {
	completed: {
		label: 'Completed',
		color: 'var(--chart-1)',
	},
	cancelled: {
		label: 'Cancelled',
		color: 'var(--chart-4)',
	},
} satisfies ChartConfig

export function BookingsTrendChart({ data }: { data: BookingTrendPoint[] }) {
	const [timeRange, setTimeRange] = useState('90d')

	const filteredData = data.filter((item) => {
		if (data.length === 0) return true
		const date = new Date(item.date)
		const latest = new Date(data[data.length - 1]!.date)
		const daysToSubtract = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
		const startDate = new Date(latest)
		startDate.setDate(latest.getDate() - daysToSubtract)
		return date >= startDate
	})

	return (
		<Card className="pt-0">
			<CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
				<div className="grid flex-1 gap-1">
					<CardTitle>Bookings Trend</CardTitle>
					<CardDescription>Completed vs cancelled bookings over time</CardDescription>
				</div>
				<Select value={timeRange} onValueChange={setTimeRange}>
					<SelectTrigger className="hidden w-[140px] rounded-lg sm:ml-auto sm:flex" aria-label="Select time range">
						<SelectValue placeholder="Last 3 months" />
					</SelectTrigger>
					<SelectContent className="rounded-xl">
						<SelectItem value="90d" className="rounded-lg">Last 3 months</SelectItem>
						<SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
						<SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
					</SelectContent>
				</Select>
			</CardHeader>
			<CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
				<ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
					<AreaChart data={filteredData}>
						<defs>
							<linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="var(--color-completed)" stopOpacity={0.8} />
								<stop offset="95%" stopColor="var(--color-completed)" stopOpacity={0.1} />
							</linearGradient>
							<linearGradient id="fillCancelled" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="var(--color-cancelled)" stopOpacity={0.8} />
								<stop offset="95%" stopColor="var(--color-cancelled)" stopOpacity={0.1} />
							</linearGradient>
						</defs>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							minTickGap={32}
							tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
						/>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
									indicator="dot"
								/>
							}
						/>
						<Area dataKey="completed" type="natural" fill="url(#fillCompleted)" stroke="var(--color-completed)" stackId="a" />
						<Area dataKey="cancelled" type="natural" fill="url(#fillCancelled)" stroke="var(--color-cancelled)" stackId="a" />
						<ChartLegend content={<ChartLegendContent />} />
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
