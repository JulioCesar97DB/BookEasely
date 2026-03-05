import { getAuthUser } from '@/lib/supabase/auth-cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAnalyticsData } from './actions'
import { AnalyticsClient } from './analytics-client'

export default async function AnalyticsPage() {
	const user = await getAuthUser()
	if (!user) redirect('/login')

	const supabase = await createClient()
	const { data: business } = await supabase
		.from('businesses')
		.select('id, name')
		.eq('owner_id', user.id)
		.single()

	if (!business) redirect('/dashboard')

	const data = await getAnalyticsData(business.id)
	if (!data) redirect('/dashboard')

	return <AnalyticsClient data={data} businessName={business.name} />
}
