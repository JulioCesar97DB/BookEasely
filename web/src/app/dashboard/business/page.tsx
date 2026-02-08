import { PageTransition } from '@/components/page-transition'
import { getUserBusiness } from '@/lib/supabase/auth-cache'
import { createClient } from '@/lib/supabase/server'
import { BusinessClient } from './business-client'

export default async function BusinessPage() {
	const business = await getUserBusiness()

	if (!business) {
		return (
			<div className="flex flex-col items-center justify-center py-20 text-center">
				<h2 className="text-xl font-semibold">No business found</h2>
				<p className="mt-2 text-muted-foreground">
					Complete onboarding to set up your business.
				</p>
			</div>
		)
	}

	const supabase = await createClient()

	const [{ data: categories }, { data: hours }] = await Promise.all([
		supabase
			.from('categories')
			.select('id, name, slug')
			.order('sort_order'),
		supabase
			.from('business_hours')
			.select('*')
			.eq('business_id', business.id)
			.order('day_of_week'),
	])

	return (
		<PageTransition>
			<BusinessClient
				business={business}
				categories={categories ?? []}
				hours={hours ?? []}
			/>
		</PageTransition>
	)
}
