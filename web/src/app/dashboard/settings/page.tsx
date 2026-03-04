import { PageTransition } from '@/components/page-transition'
import { getAuthProfile, getUserRole } from '@/lib/supabase/auth-cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClient } from './settings-client'

export default async function SettingsPage() {
	const [profile, role] = await Promise.all([getAuthProfile(), getUserRole()])

	if (!profile) redirect('/onboarding')

	const supabase = await createClient()

	const [businessResult, prefsResult] = await Promise.all([
		role === 'business_owner'
			? supabase
				.from('businesses')
				.select('id, cancellation_policy, cancellation_hours, auto_confirm, buffer_minutes')
				.eq('owner_id', profile.id)
				.single()
			: Promise.resolve({ data: null }),
		supabase
			.from('notification_preferences')
			.select('sms_enabled, push_enabled, reminder_enabled')
			.eq('user_id', profile.id)
			.single(),
	])

	const notificationPrefs = prefsResult.data ?? {
		sms_enabled: true,
		push_enabled: true,
		reminder_enabled: true,
	}

	return (
		<PageTransition>
			<SettingsClient
				profile={profile}
				role={role}
				business={businessResult.data}
				notificationPrefs={notificationPrefs}
			/>
		</PageTransition>
	)
}
