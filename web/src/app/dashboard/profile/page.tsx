import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/types'
import { redirect } from 'next/navigation'
import { ProfileClient } from './profile-client'

export default async function ProfilePage() {
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

	let businessName: string | null = null
	if (role === 'business_owner') {
		const { data } = await supabase
			.from('businesses')
			.select('name')
			.eq('owner_id', user.id)
			.single()
		businessName = data?.name ?? null
	}

	return (
		<ProfileClient
			profile={profile}
			role={role}
			businessName={businessName}
		/>
	)
}
