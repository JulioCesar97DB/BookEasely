import { AnimatedCard } from '@/components/animated-cards'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getInitials } from '@/lib/format'
import type { Service, Worker } from '@/lib/types'
import { Users } from 'lucide-react'
import { EmptyState } from './empty-state'

interface TeamTabProps {
	workers: Worker[]
	workerServiceMap: Map<string, string[]>
	servicesById: Map<string, Service>
}

export function TeamTab({
	workers,
	workerServiceMap,
	servicesById,
}: TeamTabProps) {
	if (workers.length === 0) {
		return (
			<EmptyState
				icon={Users}
				title="No team members"
				description="This business hasn't added any team members yet."
			/>
		)
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{workers.map((worker, i) => {
				const serviceIds = workerServiceMap.get(worker.id) ?? []
				const assignedServices = serviceIds
					.map((id) => servicesById.get(id))
					.filter(Boolean) as Service[]

				return (
					<AnimatedCard key={worker.id} delay={i * 0.05}>
						<Card className="py-0 h-full">
							<CardContent className="p-4">
								<div className="flex items-start gap-3">
									<Avatar className="h-12 w-12 shrink-0">
										<AvatarImage src={worker.avatar_url ?? undefined} />
										<AvatarFallback className="text-sm font-medium">
											{getInitials(worker.display_name)}
										</AvatarFallback>
									</Avatar>
									<div className="min-w-0">
										<h3 className="font-semibold text-sm">{worker.display_name}</h3>
										{worker.bio && (
											<p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
												{worker.bio}
											</p>
										)}
									</div>
								</div>

								{worker.specialties && worker.specialties.length > 0 && (
									<div className="mt-3 flex flex-wrap gap-1.5">
										{worker.specialties.map((s) => (
											<Badge
												key={s}
												variant="secondary"
												className="text-[10px] px-1.5 py-0"
											>
												{s}
											</Badge>
										))}
									</div>
								)}

								{assignedServices.length > 0 && (
									<>
										<Separator className="my-3" />
										<div>
											<p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
												Services
											</p>
											<p className="text-xs text-muted-foreground line-clamp-2">
												{assignedServices.map((s) => s.name).join(', ')}
											</p>
										</div>
									</>
								)}
							</CardContent>
						</Card>
					</AnimatedCard>
				)
			})}
		</div>
	)
}
