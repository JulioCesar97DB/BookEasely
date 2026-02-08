import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OnboardingLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const supabase = await createClient()

	// User is guaranteed to be authenticated by proxy.ts
	const { data: { user } } = await supabase.auth.getUser()

	const { data: profile } = await supabase
		.from('profiles')
		.select('onboarding_completed')
		.eq('id', user!.id)
		.single()

	// Redirect completed users back to dashboard
	if (profile?.onboarding_completed) {
		redirect('/dashboard')
	}

	return <>{children}</>
}
