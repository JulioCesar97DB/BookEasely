import { AnimatedCard } from '@/components/animated-cards'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { formatDuration, getInitials } from '@/lib/format'
import type { Service, Worker } from '@/lib/types'
import { Calendar, Clock } from 'lucide-react'
import { EmptyState } from './empty-state'

interface ServicesTabProps {
	services: Service[]
	serviceWorkerMap: Map<string, string[]>
	workersById: Map<string, Worker>
}

export function ServicesTab({
	services,
	serviceWorkerMap,
	workersById,
}: ServicesTabProps) {
	if (services.length === 0) {
		return (
			<EmptyState
				icon={Calendar}
				title="No services listed"
				description="This business hasn't added any services yet."
			/>
		)
	}

	return (
		<div className="space-y-3">
			{services.map((service, i) => {
				const workerIds = serviceWorkerMap.get(service.id) ?? []
				const assignedWorkers = workerIds
					.map((id) => workersById.get(id))
					.filter(Boolean) as Worker[]

				return (
					<AnimatedCard key={service.id} delay={i * 0.05}>
						<Card className="py-0">
							<CardContent className="p-4">
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1 min-w-0">
										<h3 className="font-semibold text-sm">{service.name}</h3>
										{service.description && (
											<p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
												{service.description}
											</p>
										)}
										<div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
											<span className="flex items-center gap-1">
												<Clock className="h-3 w-3" />
												{formatDuration(service.duration_minutes)}
											</span>
											{assignedWorkers.length > 0 && (
												<div className="flex items-center gap-1">
													<span>with</span>
													<div className="flex -space-x-1.5">
														{assignedWorkers.slice(0, 3).map((w) => (
															<Avatar
																key={w.id}
																className="h-5 w-5 border-2 border-background"
															>
																<AvatarImage src={w.avatar_url ?? undefined} />
																<AvatarFallback className="text-[8px]">
																	{getInitials(w.display_name)}
																</AvatarFallback>
															</Avatar>
														))}
													</div>
													{assignedWorkers.length > 3 && (
														<span>+{assignedWorkers.length - 3}</span>
													)}
												</div>
											)}
										</div>
									</div>
									<div className="text-right shrink-0">
										<p className="font-semibold text-sm">
											${Number(service.price).toFixed(0)}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</AnimatedCard>
				)
			})}
		</div>
	)
}
