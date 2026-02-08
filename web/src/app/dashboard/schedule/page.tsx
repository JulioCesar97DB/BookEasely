import { getUserBusiness } from '@/lib/supabase/auth-cache'
import { createClient } from '@/lib/supabase/server'
import { ScheduleClient } from './schedule-client'

export default async function SchedulePage() {
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

	const [{ data: businessHours }, { data: workers }, { data: availability }, { data: blockedDates }] = await Promise.all([
		supabase
			.from('business_hours')
			.select('*')
			.eq('business_id', business.id)
			.order('day_of_week'),
		supabase
			.from('workers')
			.select('id, display_name, is_active')
			.eq('business_id', business.id)
			.eq('is_active', true),
		supabase
			.from('worker_availability')
			.select('*'),
		supabase
			.from('worker_blocked_dates')
			.select('*'),
	])

	return (
		<ScheduleClient
			businessHours={businessHours ?? []}
			workers={workers ?? []}
			availability={availability ?? []}
			blockedDates={blockedDates ?? []}
		/>
	)
}
