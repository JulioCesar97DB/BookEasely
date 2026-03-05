import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function AnalyticsLoading() {
	return (
		<div className="space-y-8">
			<div>
				<Skeleton className="h-9 w-48" />
				<Skeleton className="mt-1 h-5 w-72" />
			</div>
			<div className="grid gap-4 sm:grid-cols-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<Card key={i} className="p-6">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="mt-2 h-8 w-16" />
					</Card>
				))}
			</div>
			<div className="grid gap-4 lg:grid-cols-2">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i} className="p-6">
						<Skeleton className="h-[250px] w-full" />
					</Card>
				))}
			</div>
		</div>
	)
}
