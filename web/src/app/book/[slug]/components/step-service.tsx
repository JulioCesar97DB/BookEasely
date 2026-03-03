'use client'

import { Card, CardContent } from '@/components/ui/card'
import { formatDuration } from '@/lib/format'
import type { Service } from '@/lib/types'
import { Clock } from 'lucide-react'

interface StepServiceProps {
	services: Service[]
	onSelectService: (service: Service) => void
}

export function StepService({ services, onSelectService }: StepServiceProps) {
	return (
		<div className="space-y-3">
			<h2 className="text-lg font-semibold">Select a Service</h2>
			{services.map((service) => (
				<Card
					key={service.id}
					className="cursor-pointer transition-all hover:border-primary/40 hover:shadow-sm py-0"
					onClick={() => onSelectService(service)}
				>
					<CardContent className="flex items-center justify-between p-4">
						<div className="flex-1 min-w-0">
							<h3 className="font-medium text-sm">{service.name}</h3>
							{service.description && (
								<p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{service.description}</p>
							)}
							<div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
								<span className="flex items-center gap-1">
									<Clock className="h-3 w-3" />
									{formatDuration(service.duration_minutes)}
								</span>
							</div>
						</div>
						<span className="text-sm font-semibold ml-4">${Number(service.price).toFixed(0)}</span>
					</CardContent>
				</Card>
			))}
		</div>
	)
}
