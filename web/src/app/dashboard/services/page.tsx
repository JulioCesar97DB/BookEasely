import { getUserBusiness } from '@/lib/supabase/auth-cache'
import { createClient } from '@/lib/supabase/server'
import { ServicesClient } from './services-client'

export default async function ServicesPage() {
	const business = await getUserBusiness()

	if (!business) {
		return (
			<div className="flex flex-col items-center justify-center py-20 text-center">
				<h2 className="text-xl font-semibold">No business found</h2>
				<p className="mt-2 text-muted-foreground">
					Complete onboarding to set up your business first.
				</p>
			</div>
		)
	}

	const supabase = await createClient()

	const [{ data: services }, { data: workers }, { data: serviceWorkers }] = await Promise.all([
		supabase
			.from('services')
			.select('*')
			.eq('business_id', business.id)
			.order('created_at'),
		supabase
			.from('workers')
			.select('id, display_name, is_active')
			.eq('business_id', business.id)
			.eq('is_active', true),
		supabase
			.from('service_workers')
			.select('service_id, worker_id'),
	])

	return (
		<ServicesClient
			businessId={business.id}
			services={services ?? []}
			workers={workers ?? []}
			serviceWorkers={serviceWorkers ?? []}
		/>
	)
}
