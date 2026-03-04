import { getUserBusiness } from '@/lib/supabase/auth-cache'
import { createClient } from '@/lib/supabase/server'
import { CalendarClient } from './calendar-client'

export default async function CalendarPage() {
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

	const [{ data: workers }, { data: businessHours }] = await Promise.all([
		supabase
			.from('workers')
			.select('id, display_name, avatar_url, is_active')
			.eq('business_id', business.id)
			.eq('is_active', true),
		supabase
			.from('business_hours')
			.select('*')
			.eq('business_id', business.id)
			.order('day_of_week'),
	])

	return (
		<CalendarClient
			businessId={business.id}
			workers={(workers ?? []) as { id: string; display_name: string; avatar_url: string | null; is_active: boolean }[]}
			businessHours={(businessHours ?? []) as { id: string; business_id: string; day_of_week: number; open_time: string; close_time: string; is_closed: boolean }[]}
		/>
	)
}
