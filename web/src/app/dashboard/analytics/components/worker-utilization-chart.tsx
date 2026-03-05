'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import type { WorkerBookings } from '../actions'

const chartConfig = {
	bookings: {
		label: 'Bookings',
		color: 'var(--chart-3)',
	},
} satisfies ChartConfig

export function WorkerUtilizationChart({ data }: { data: WorkerBookings[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Worker Utilization</CardTitle>
				<CardDescription>Bookings per team member (active bookings)</CardDescription>
			</CardHeader>
			<CardContent className="px-2 sm:px-6">
				<ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
					<BarChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="name"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value) => value.length > 10 ? `${value.slice(0, 10)}...` : value}
						/>
						<YAxis tickLine={false} axisLine={false} allowDecimals={false} />
						<ChartTooltip content={<ChartTooltipContent />} />
						<Bar dataKey="bookings" fill="var(--color-bookings)" radius={[4, 4, 0, 0]} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
