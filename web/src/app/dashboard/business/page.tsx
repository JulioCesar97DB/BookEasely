import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BusinessClient } from './business-client'

export const dynamic = 'force-dynamic'

export default async function BusinessPage() {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()

	if (!user) redirect('/auth/login')

	const { data: business } = await supabase
		.from('businesses')
		.select('*')
		.eq('owner_id', user.id)
		.single()

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

	const { data: categories } = await supabase
		.from('categories')
		.select('id, name, slug')
		.order('sort_order')

	const { data: hours } = await supabase
		.from('business_hours')
		.select('*')
		.eq('business_id', business.id)
		.order('day_of_week')

	return (
		<BusinessClient
			business={business}
			categories={categories ?? []}
			hours={hours ?? []}
		/>
	)
}
