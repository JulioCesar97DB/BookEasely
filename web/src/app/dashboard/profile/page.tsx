import { PageTransition } from '@/components/page-transition'
import { getAuthProfile, getUserRole } from '@/lib/supabase/auth-cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from './profile-client'

export default async function ProfilePage() {
	const [profile, role] = await Promise.all([getAuthProfile(), getUserRole()])

	if (!profile) redirect('/onboarding')

	let businessName: string | null = null
	if (role === 'business_owner') {
		const supabase = await createClient()
		const { data } = await supabase
			.from('businesses')
			.select('name')
			.eq('owner_id', profile.id)
			.single()
		businessName = data?.name ?? null
	}

	return (
		<PageTransition>
			<ProfileClient
				profile={profile}
				role={role}
				businessName={businessName}
			/>
		</PageTransition>
	)
}
