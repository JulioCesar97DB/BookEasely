import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export function QuickAction({
	href,
	icon: Icon,
	label,
	count,
	countLabel,
}: {
	href: string
	icon: React.ComponentType<{ className?: string }>
	label: string
	count?: number
	countLabel?: string
}) {
	return (
		<Link href={href}>
			<Card className="transition-all hover:shadow-md hover:border-primary/30 cursor-pointer">
				<CardContent className="flex items-center gap-3 py-4">
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
						<Icon className="h-4.5 w-4.5 text-primary" />
					</div>
					<div>
						<p className="text-sm font-medium">{label}</p>
						{count !== undefined && (
							<p className="text-xs text-muted-foreground">{count} {countLabel}</p>
						)}
					</div>
				</CardContent>
			</Card>
		</Link>
	)
}
