interface EmptyStateProps {
	icon: React.ComponentType<{ className?: string }>
	title: string
	description: string
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<div className="rounded-full bg-muted p-4 mb-4">
				<Icon className="h-6 w-6 text-muted-foreground" />
			</div>
			<h3 className="font-medium text-sm">{title}</h3>
			<p className="mt-1 text-xs text-muted-foreground max-w-xs">{description}</p>
		</div>
	)
}
