import { Card, CardContent } from '@/components/ui/card'
import { Heart } from 'lucide-react'

export default function FavoritesPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Favorites</h1>
				<p className="mt-1 text-muted-foreground">
					Businesses you&apos;ve saved for quick access
				</p>
			</div>

			<Card>
				<CardContent className="flex flex-col items-center justify-center py-16 text-center">
					<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
						<Heart className="h-7 w-7 text-primary" />
					</div>
					<h3 className="mt-4 font-semibold">No favorites yet</h3>
					<p className="mt-1 max-w-sm text-sm text-muted-foreground">
						Save businesses you love to find them quickly later. Tap the heart icon on any business to add it here.
					</p>
				</CardContent>
			</Card>
		</div>
	)
}
