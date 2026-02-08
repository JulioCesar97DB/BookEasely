import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WorkersClient } from './workers-client'

export const dynamic = 'force-dynamic'

export default async function WorkersPage() {
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

	const { data: workers } = await supabase
		.from('workers')
		.select('*')
		.eq('business_id', business.id)
		.order('created_at')

	const { data: availability } = await supabase
		.from('worker_availability')
		.select('*')

	const { data: blockedDates } = await supabase
		.from('worker_blocked_dates')
		.select('*')
		.order('date')

	// Check if owner is already a worker
	const ownerIsWorker = workers?.some((w) => w.user_id === user.id) ?? false

	const { data: profile } = await supabase
		.from('profiles')
		.select('full_name')
		.eq('id', user.id)
		.single()

	return (
		<WorkersClient
			businessId={business.id}
			userId={user.id}
			userName={profile?.full_name ?? ''}
			workers={workers ?? []}
			availability={availability ?? []}
			blockedDates={blockedDates ?? []}
			ownerIsWorker={ownerIsWorker}
		/>
	)
}
