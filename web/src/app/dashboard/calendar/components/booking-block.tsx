'use client'

import { CALENDAR_HOURS, HALF_HOUR_HEIGHT } from '@/lib/constants'
import { formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { CalendarBooking } from '../calendar-client'

interface BookingBlockProps {
	booking: CalendarBooking
	colorIndex: number
	onClick: () => void
	index: number
}

const FIRST_HOUR = CALENDAR_HOURS[0]
const PIXELS_PER_MINUTE = (HALF_HOUR_HEIGHT * 2) / 60

// Dynamic color classes for booking blocks
const BLOCK_COLORS = [
	{ bg: 'bg-[oklch(0.75_0.15_230)]', border: 'border-[oklch(0.55_0.19_230)]', text: 'text-[oklch(0.25_0.08_230)]' },
	{ bg: 'bg-[oklch(0.75_0.15_160)]', border: 'border-[oklch(0.55_0.19_160)]', text: 'text-[oklch(0.25_0.08_160)]' },
	{ bg: 'bg-[oklch(0.75_0.15_30)]', border: 'border-[oklch(0.55_0.19_30)]', text: 'text-[oklch(0.25_0.08_30)]' },
	{ bg: 'bg-[oklch(0.75_0.15_300)]', border: 'border-[oklch(0.55_0.19_300)]', text: 'text-[oklch(0.25_0.08_300)]' },
	{ bg: 'bg-[oklch(0.75_0.15_80)]', border: 'border-[oklch(0.55_0.19_80)]', text: 'text-[oklch(0.25_0.08_80)]' },
]

// Dark mode overrides
const BLOCK_COLORS_DARK = [
	{ bg: 'dark:bg-[oklch(0.35_0.12_230)]', border: 'dark:border-[oklch(0.50_0.15_230)]', text: 'dark:text-[oklch(0.85_0.08_230)]' },
	{ bg: 'dark:bg-[oklch(0.35_0.12_160)]', border: 'dark:border-[oklch(0.50_0.15_160)]', text: 'dark:text-[oklch(0.85_0.08_160)]' },
	{ bg: 'dark:bg-[oklch(0.35_0.12_30)]', border: 'dark:border-[oklch(0.50_0.15_30)]', text: 'dark:text-[oklch(0.85_0.08_30)]' },
	{ bg: 'dark:bg-[oklch(0.35_0.12_300)]', border: 'dark:border-[oklch(0.50_0.15_300)]', text: 'dark:text-[oklch(0.85_0.08_300)]' },
	{ bg: 'dark:bg-[oklch(0.35_0.12_80)]', border: 'dark:border-[oklch(0.50_0.15_80)]', text: 'dark:text-[oklch(0.85_0.08_80)]' },
]

export function BookingBlock({ booking, colorIndex, onClick, index }: BookingBlockProps) {
	const startMin = timeToMin(booking.start_time)
	const endMin = timeToMin(booking.end_time)
	const duration = endMin - startMin

	const top = (startMin - FIRST_HOUR * 60) * PIXELS_PER_MINUTE
	const height = Math.max(duration * PIXELS_PER_MINUTE, 24) // min 24px

	const colors = BLOCK_COLORS[colorIndex % BLOCK_COLORS.length]
	const darkColors = BLOCK_COLORS_DARK[colorIndex % BLOCK_COLORS_DARK.length]

	const isPending = booking.status === 'pending'
	const isCompleted = booking.status === 'completed'
	const isCancelled = booking.status === 'cancelled'
	const isShort = duration <= 30
	const isTiny = duration <= 15

	const clientName = booking.profiles?.full_name ?? 'Unknown'
	const serviceName = booking.services?.name ?? 'Service'
	const timeLabel = `${formatTime(booking.start_time)} – ${formatTime(booking.end_time)}`
	const priceLabel = booking.services ? `$${Number(booking.services.price).toFixed(0)}` : ''
	const workerName = booking.workers?.display_name ?? ''

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<motion.button
						type="button"
						onClick={onClick}
						initial={{ opacity: 0, scale: 0.92 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.2, delay: index * 0.03 }}
						className={cn(
							'absolute left-1 right-1 z-10 flex flex-col rounded-lg border-l-[3px] px-1.5 py-0.5 text-left transition-all',
							'cursor-pointer hover:shadow-md hover:scale-[1.02] hover:z-20',
							// Base colors
							colors.bg, colors.border, colors.text,
							// Dark mode
							darkColors.bg, darkColors.border, darkColors.text,
							// Status-specific styles
							isPending && 'opacity-75 border-dashed animate-pulse',
							isCompleted && 'opacity-70',
							isCancelled && 'opacity-40 line-through',
						)}
						style={{ top, height }}
					>
						{/* Content adapts to block height */}
						{!isTiny && (
							<span className="text-[10px] font-semibold leading-tight truncate w-full">
								{clientName}
							</span>
						)}
						{!isShort && (
							<span className="text-[9px] leading-tight truncate w-full opacity-80">
								{serviceName}
							</span>
						)}
						{isTiny ? (
							<span className="text-[9px] font-medium leading-tight truncate w-full">
								{clientName} · {formatTime(booking.start_time)}
							</span>
						) : (
							<span className="text-[9px] leading-tight opacity-70 truncate w-full">
								{formatTime(booking.start_time)}
							</span>
						)}

						{/* Status icon overlay */}
						{isCompleted && (
							<span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-500/20">
								<Check className="h-2.5 w-2.5 text-green-600 dark:text-green-400" />
							</span>
						)}
						{isCancelled && (
							<span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500/20">
								<X className="h-2.5 w-2.5 text-red-600 dark:text-red-400" />
							</span>
						)}
					</motion.button>
				</TooltipTrigger>
				<TooltipContent side="right" sideOffset={8} className="max-w-[200px]">
					<div className="space-y-1">
						<p className="font-semibold text-xs">{clientName}</p>
						<p className="text-xs text-muted-foreground">{serviceName}</p>
						<p className="text-xs text-muted-foreground">{timeLabel}</p>
						{workerName && <p className="text-xs text-muted-foreground">Worker: {workerName}</p>}
						{priceLabel && <p className="text-xs font-medium">{priceLabel}</p>}
						<p className="text-[10px] capitalize font-medium">
							Status: {booking.status}
						</p>
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}

function timeToMin(time: string): number {
	const [h, m] = time.split(':').map(Number)
	return h * 60 + m
}
