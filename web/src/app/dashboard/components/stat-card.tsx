import { Card, CardContent } from '@/components/ui/card'

export function StatCard({
	title,
	value,
	description,
	icon: Icon,
}: {
	title: string
	value: string
	description: string
	icon: React.ComponentType<{ className?: string }>
}) {
	return (
		<Card>
			<CardContent className="pt-6">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">{title}</p>
						<p className="text-2xl font-bold">{value}</p>
						<p className="text-xs text-muted-foreground">{description}</p>
					</div>
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
						<Icon className="h-5 w-5 text-primary" />
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
