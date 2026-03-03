'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export type Step = 'service' | 'worker' | 'datetime' | 'confirm'
export const STEPS: Step[] = ['service', 'worker', 'datetime', 'confirm']

interface BookingProgressProps {
	currentStepIndex: number
}

export function BookingProgress({ currentStepIndex }: BookingProgressProps) {
	return (
		<div className="mt-4 flex items-center gap-2">
			{STEPS.map((s, i) => (
				<div key={s} className="flex items-center gap-2">
					<div
						className={cn(
							'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors',
							i < currentStepIndex
								? 'bg-primary text-primary-foreground'
								: i === currentStepIndex
									? 'bg-primary text-primary-foreground'
									: 'bg-muted text-muted-foreground'
						)}
					>
						{i < currentStepIndex ? <Check className="h-3.5 w-3.5" /> : i + 1}
					</div>
					{i < STEPS.length - 1 && (
						<div className={cn(
							'h-0.5 w-8 sm:w-12',
							i < currentStepIndex ? 'bg-primary' : 'bg-muted'
						)} />
					)}
				</div>
			))}
		</div>
	)
}
