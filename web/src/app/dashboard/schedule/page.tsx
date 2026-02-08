import { createClient } from '@/lib/supabase/server'
import { ScheduleClient } from './schedule-client'

export default async function SchedulePage() {
	const supabase = await createClient()

	// User is guaranteed to be authenticated by proxy.ts
	const { data: { user } } = await supabase.auth.getUser()

	const { data: business } = await supabase
		.from('businesses')
		.select('id')
		.eq('owner_id', user!.id)
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

	const { data: businessHours } = await supabase
		.from('business_hours')
		.select('*')
		.eq('business_id', business.id)
		.order('day_of_week')

	const { data: workers } = await supabase
		.from('workers')
		.select('id, display_name, is_active')
		.eq('business_id', business.id)
		.eq('is_active', true)

	const { data: availability } = await supabase
		.from('worker_availability')
		.select('*')

	const { data: blockedDates } = await supabase
		.from('worker_blocked_dates')
		.select('*')

	return (
		<ScheduleClient
			businessHours={businessHours ?? []}
			workers={workers ?? []}
			availability={availability ?? []}
			blockedDates={blockedDates ?? []}
		/>
	)
}
