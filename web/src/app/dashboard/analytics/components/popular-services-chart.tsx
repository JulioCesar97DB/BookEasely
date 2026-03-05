'use client'

import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import type { PopularService } from '../actions'

export function PopularServicesChart({ data }: { data: PopularService[] }) {
	const chartConfig = data.reduce<Record<string, { label: string; color: string }>>(
		(acc, service) => {
			acc[service.name] = { label: service.name, color: service.fill }
			return acc
		},
		{ bookings: { label: 'Bookings', color: 'var(--chart-1)' } }
	) satisfies ChartConfig

	return (
		<Card>
			<CardHeader>
				<CardTitle>Popular Services</CardTitle>
				<CardDescription>Top {data.length} services by booking count</CardDescription>
			</CardHeader>
			<CardContent className="px-2 sm:px-6">
				<ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
					<BarChart accessibilityLayer data={data} layout="vertical" margin={{ left: 0, right: 12 }}>
						<YAxis
							dataKey="name"
							type="category"
							tickLine={false}
							axisLine={false}
							width={100}
							tickFormatter={(value) => value.length > 14 ? `${value.slice(0, 14)}...` : value}
						/>
						<XAxis type="number" tickLine={false} axisLine={false} />
						<ChartTooltip content={<ChartTooltipContent />} />
						<Bar dataKey="bookings" radius={[0, 4, 4, 0]}>
							{data.map((entry) => (
								<Cell key={entry.name} fill={entry.fill} />
							))}
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
