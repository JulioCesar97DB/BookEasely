import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ServicesClient } from './services-client'

export const dynamic = 'force-dynamic'

export default async function ServicesPage() {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()

	if (!user) redirect('/auth/login')

	const { data: business } = await supabase
		.from('businesses')
		.select('id')
		.eq('owner_id', user.id)
		.single()

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

	const { data: services } = await supabase
		.from('services')
		.select('*')
		.eq('business_id', business.id)
		.order('created_at')

	const { data: workers } = await supabase
		.from('workers')
		.select('id, display_name, is_active')
		.eq('business_id', business.id)
		.eq('is_active', true)

	const { data: serviceWorkers } = await supabase
		.from('service_workers')
		.select('service_id, worker_id')

	return (
		<ServicesClient
			businessId={business.id}
			services={services ?? []}
			workers={workers ?? []}
			serviceWorkers={serviceWorkers ?? []}
		/>
	)
}
