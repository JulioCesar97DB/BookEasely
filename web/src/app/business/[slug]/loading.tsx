import { Skeleton } from '@/components/ui/skeleton'

export default function BusinessProfileLoading() {
	return (
		<div className="min-h-svh">
			{/* Header skeleton */}
			<div className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
					<div className="flex items-center gap-2.5">
						<Skeleton className="h-8 w-8 rounded-lg" />
						<Skeleton className="h-5 w-24" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-9 w-9 rounded-md" />
						<Skeleton className="h-8 w-16 rounded-md" />
					</div>
				</div>
			</div>

			{/* Hero skeleton */}
			<Skeleton className="aspect-[2/1] w-full rounded-none" />

			{/* Info bar skeleton */}
			<div className="border-b">
				<div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-4">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-4 w-40" />
							<Skeleton className="h-5 w-16 rounded-full" />
						</div>
						<Skeleton className="hidden sm:block h-10 w-28 rounded-md" />
					</div>
				</div>
			</div>

			{/* Tab skeleton */}
			<div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
				<div className="flex gap-4 mb-6">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-9 w-24" />
					))}
				</div>
				<div className="space-y-3">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className="h-20 w-full rounded-xl" />
					))}
				</div>
			</div>
		</div>
	)
}
