import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
	return (
		<div className="space-y-8">
			{/* Title */}
			<div className="space-y-2">
				<Skeleton className="h-9 w-64" />
				<Skeleton className="h-5 w-40" />
			</div>

			{/* Stat cards */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className="h-28 rounded-xl" />
				))}
			</div>

			{/* Content area */}
			<div className="space-y-4">
				<Skeleton className="h-6 w-32" />
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-16 rounded-xl" />
					))}
				</div>
			</div>
		</div>
	)
}
