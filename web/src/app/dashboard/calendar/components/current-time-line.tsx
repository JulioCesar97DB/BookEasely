'use client'

import { CALENDAR_HOURS, HALF_HOUR_HEIGHT } from '@/lib/constants'
import { isToday } from 'date-fns'
import { useEffect, useState } from 'react'

interface CurrentTimeLineProps {
	weekDates: Date[]
}

const FIRST_HOUR = CALENDAR_HOURS[0]
const PIXELS_PER_MINUTE = (HALF_HOUR_HEIGHT * 2) / 60

function getCurrentMinutes(): number {
	const now = new Date()
	return now.getHours() * 60 + now.getMinutes()
}

export function CurrentTimeLine({ weekDates }: CurrentTimeLineProps) {
	const [minutes, setMinutes] = useState(getCurrentMinutes)

	useEffect(() => {
		const interval = setInterval(() => setMinutes(getCurrentMinutes()), 60_000)
		return () => clearInterval(interval)
	}, [])

	// Find which column index is today (if visible)
	const todayIndex = weekDates.findIndex((d) => isToday(d))
	if (todayIndex === -1) return null

	const top = (minutes - FIRST_HOUR * 60) * PIXELS_PER_MINUTE

	// Don't render if outside visible range
	if (top < 0 || top > CALENDAR_HOURS.length * HALF_HOUR_HEIGHT * 2) return null

	// Calculate left position: skip 60px time column + todayIndex * column width
	// Since we're using CSS grid (60px + 7 equal columns), we use percentage for the columns
	const colWidthPercent = 100 / 7
	const leftPercent = colWidthPercent * todayIndex

	return (
		<div
			className="absolute pointer-events-none z-30"
			style={{
				top,
				left: 60, // skip time column
				right: 0,
			}}
		>
			{/* Full-width line */}
			<div className="relative w-full">
				{/* Red dot on the left edge of today's column */}
				<div
					className="absolute -top-[4px] h-[9px] w-[9px] rounded-full bg-red-500 shadow-sm"
					style={{ left: `${leftPercent}%` }}
				>
					{/* Pulse ring */}
					<span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
				</div>
				{/* Line */}
				<div className="w-full h-[1.5px] bg-red-500/70" />
			</div>
		</div>
	)
}
