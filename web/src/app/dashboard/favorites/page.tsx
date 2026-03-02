import { BusinessCard } from '@/components/business-card'
import { PageTransition } from '@/components/page-transition'
import { Card, CardContent } from '@/components/ui/card'
import { getAuthUser } from '@/lib/supabase/auth-cache'
import { createClient } from '@/lib/supabase/server'
import { Heart } from 'lucide-react'

export default async function FavoritesPage() {
	const user = await getAuthUser()
	const supabase = await createClient()

	const { data: favorites } = await supabase
		.from('favorites')
		.select('id, business_id, businesses(*, categories(name, slug))')
		.eq('client_id', user!.id)
		.order('created_at', { ascending: false })

	const businesses = (favorites ?? [])
		.map((f) => f.businesses)
		.filter(Boolean)

	return (
		<PageTransition>
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Favorites</h1>
					<p className="mt-1 text-muted-foreground">
						Businesses you&apos;ve saved for quick access
					</p>
				</div>

				{businesses.length === 0 ? (
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
				) : (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{businesses.map((biz: any) => (
							<BusinessCard key={biz.id} business={biz} />
						))}
					</div>
				)}
			</div>
		</PageTransition>
	)
}
