'use client'

import { useMemo } from 'react'
import { Label, Pie, PieChart } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import type { StatusCount } from '../actions'

const STATUS_LABELS: Record<string, string> = {
	completed: 'Completed',
	confirmed: 'Confirmed',
	pending: 'Pending',
	cancelled: 'Cancelled',
	no_show: 'No Show',
}

export function StatusBreakdownChart({ data }: { data: StatusCount[] }) {
	const total = useMemo(() => data.reduce((sum, d) => sum + d.count, 0), [data])

	const chartConfig = data.reduce<Record<string, { label: string; color?: string }>>(
		(acc, item) => {
			acc[item.status] = { label: STATUS_LABELS[item.status] ?? item.status, color: item.fill }
			return acc
		},
		{ count: { label: 'Bookings' } }
	) satisfies ChartConfig

	return (
		<Card className="flex flex-col">
			<CardHeader className="items-center pb-0">
				<CardTitle>Status Breakdown</CardTitle>
				<CardDescription>Bookings by status (last 90 days)</CardDescription>
			</CardHeader>
			<CardContent className="flex-1 pb-0">
				<ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
					<PieChart>
						<ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
						<Pie data={data} dataKey="count" nameKey="status" innerRadius={60} strokeWidth={5}>
							<Label
								content={({ viewBox }) => {
									if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
										return (
											<text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
												<tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
													{total.toLocaleString()}
												</tspan>
												<tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
													Bookings
												</tspan>
											</text>
										)
									}
								}}
							/>
						</Pie>
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
