import { PageTransition } from '@/components/page-transition'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'

export default function ReviewsPage() {
	return (
		<PageTransition>
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
					<p className="mt-1 text-muted-foreground">
						Customer feedback and ratings for your business
					</p>
				</div>

				<Card>
					<CardContent className="flex flex-col items-center justify-center py-16 text-center">
						<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
							<Star className="h-7 w-7 text-primary" />
						</div>
						<h3 className="mt-4 font-semibold">No reviews yet</h3>
						<p className="mt-1 max-w-sm text-sm text-muted-foreground">
							Reviews from your clients will appear here once they start sharing their experiences.
						</p>
					</CardContent>
				</Card>
			</div>
		</PageTransition>
	)
}
