import { PublicHeader } from '@/components/public-header'
import { createClient } from '@/lib/supabase/server'
import type { BusinessWithCategory } from '@/lib/types'
import { LandingClient } from './landing-client'

export default async function HomePage() {
	const supabase = await createClient()

	const { data: featuredBusinesses } = await supabase
		.from('businesses')
		.select('*, categories(name, slug)')
		.eq('is_active', true)
		.order('rating_avg', { ascending: false })
		.limit(8)

	return (
		<div className="min-h-svh">
			<PublicHeader />
			<LandingClient
				featuredBusinesses={(featuredBusinesses ?? []) as unknown as BusinessWithCategory[]}
			/>
		</div>
	)
}
