import { PageTransition } from '@/components/page-transition'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/types'
import { redirect } from 'next/navigation'
import { SettingsClient } from './settings-client'

export default async function SettingsPage() {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()

	if (!user) {
		redirect('/auth/login')
	}

	const { data: profile } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', user.id)
		.single()

	if (!profile) {
		redirect('/onboarding')
	}

	const role = profile.role as UserRole

	let business = null
	if (role === 'business_owner') {
		const { data } = await supabase
			.from('businesses')
			.select('id, cancellation_policy, cancellation_hours, auto_confirm, buffer_minutes')
			.eq('owner_id', user.id)
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
