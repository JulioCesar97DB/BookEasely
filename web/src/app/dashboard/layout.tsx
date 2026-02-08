import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/types'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const supabase = await createClient()

	// User is guaranteed to be authenticated by proxy.ts
	const { data: { user } } = await supabase.auth.getUser()

	const { data: profile } = await supabase
		.from('profiles')
		.select('full_name, role, onboarding_completed')
		.eq('id', user!.id)
		.single()

	// Use profile role if available, otherwise fall back to auth metadata
	const role = (profile?.role ?? user!.user_metadata?.role ?? 'client') as UserRole
	const userName = profile?.full_name || user!.user_metadata?.full_name || user!.email || 'User'

	// Redirect to onboarding if not completed
	if (!profile || !profile.onboarding_completed) {
		redirect('/onboarding')
	}

	return (
		<div className="flex min-h-svh">
			<DashboardSidebar role={role} userName={userName} />
			<main className="flex-1 overflow-auto">
				<div className="mx-auto max-w-6xl px-6 py-8">
					{children}
				</div>
			</main>
		</div>
	)
}
