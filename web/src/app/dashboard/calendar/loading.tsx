import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
	return (
		<div className="space-y-4">
			{/* Header skeleton */}
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-32" />
				<div className="flex items-center gap-2">
					<Skeleton className="h-9 w-9 rounded-lg" />
					<Skeleton className="h-9 w-36" />
					<Skeleton className="h-9 w-9 rounded-lg" />
				</div>
				<Skeleton className="h-9 w-48" />
			</div>

			{/* Filter chips skeleton */}
			<div className="flex items-center gap-2">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className="h-7 w-20 rounded-full" />
				))}
			</div>

			{/* Grid skeleton */}
			<div className="rounded-xl border bg-card overflow-hidden">
				{/* Day headers */}
				<div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
					<Skeleton className="h-12" />
					{Array.from({ length: 7 }).map((_, i) => (
						<Skeleton key={i} className="h-12 border-l" />
					))}
				</div>
				{/* Time rows */}
				{Array.from({ length: 10 }).map((_, i) => (
					<div key={i} className="grid grid-cols-[60px_repeat(7,1fr)] border-b last:border-b-0">
						<Skeleton className="h-20" />
						{Array.from({ length: 7 }).map((_, j) => (
							<Skeleton key={j} className="h-20 border-l" />
						))}
					</div>
				))}
			</div>
		</div>
	)
}
