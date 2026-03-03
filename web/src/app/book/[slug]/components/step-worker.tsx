'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDuration, getInitials } from '@/lib/format'
import type { Service, Worker } from '@/lib/types'
import { ArrowLeft, Shuffle, User } from 'lucide-react'

interface StepWorkerProps {
	selectedService: Service
	availableWorkers: Worker[]
	onSelectWorker: (worker: Worker) => void
	onSelectAnyWorker: () => void
	onBack: () => void
}

export function StepWorker({
	selectedService,
	availableWorkers,
	onSelectWorker,
	onSelectAnyWorker,
	onBack,
}: StepWorkerProps) {
	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Select a Professional</h2>
				<Button variant="ghost" size="sm" onClick={onBack}>
					<ArrowLeft className="h-4 w-4 mr-1" />
					Back
				</Button>
			</div>
			<p className="text-sm text-muted-foreground">
				For: {selectedService.name} ({formatDuration(selectedService.duration_minutes)})
			</p>
			{availableWorkers.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center">
						<User className="h-8 w-8 mx-auto text-muted-foreground/40" />
						<p className="mt-3 text-sm text-muted-foreground">No professionals available for this service</p>
					</CardContent>
				</Card>
			) : (
				<>
					{availableWorkers.length > 1 && (
						<Card
							className="cursor-pointer transition-all hover:border-primary/40 hover:shadow-sm py-0 border-dashed"
							onClick={onSelectAnyWorker}
						>
							<CardContent className="flex items-center gap-3 p-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
									<Shuffle className="h-5 w-5 text-primary" />
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="font-medium text-sm">Any available professional</h3>
									<p className="text-xs text-muted-foreground">We&apos;ll pick whoever has the best availability</p>
								</div>
							</CardContent>
						</Card>
					)}
					{availableWorkers.map((worker) => (
						<Card
							key={worker.id}
							className="cursor-pointer transition-all hover:border-primary/40 hover:shadow-sm py-0"
							onClick={() => onSelectWorker(worker)}
						>
							<CardContent className="flex items-center gap-3 p-4">
								<Avatar className="h-10 w-10">
									<AvatarImage src={worker.avatar_url ?? undefined} />
									<AvatarFallback className="text-xs">{getInitials(worker.display_name)}</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<h3 className="font-medium text-sm">{worker.display_name}</h3>
									{worker.bio && (
										<p className="text-xs text-muted-foreground line-clamp-1">{worker.bio}</p>
									)}
									{worker.specialties && worker.specialties.length > 0 && (
										<div className="flex gap-1 mt-1 flex-wrap">
											{worker.specialties.slice(0, 3).map((s) => (
												<Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">
													{s}
												</Badge>
											))}
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</>
			)}
		</div>
	)
}
