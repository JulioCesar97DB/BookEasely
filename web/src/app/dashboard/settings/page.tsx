import { PageTransition } from '@/components/page-transition'
import { getAuthProfile, getUserRole } from '@/lib/supabase/auth-cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClient } from './settings-client'

export default async function SettingsPage() {
	const [profile, role] = await Promise.all([getAuthProfile(), getUserRole()])

	if (!profile) redirect('/onboarding')

	let business = null
	if (role === 'business_owner') {
		const supabase = await createClient()
		const { data } = await supabase
			.from('businesses')
			.select('id, cancellation_policy, cancellation_hours, auto_confirm, buffer_minutes')
			.eq('owner_id', profile.id)
			.single()
		business = data
	}

	return (
		<PageTransition>
			<SettingsClient
				profile={profile}
				role={role}
				business={business}
			/>
		</PageTransition>
	)
}
