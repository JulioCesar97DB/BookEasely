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

	const { data: { user } } = await supabase.auth.getUser()

	// Proxy should block unauthenticated access, but guard against edge cases
	if (!user) {
		redirect('/auth/login')
	}

	const { data: profile } = await supabase
		.from('profiles')
		.select('full_name, role, onboarding_completed')
		.eq('id', user.id)
		.single()

	// Use profile role if available, otherwise fall back to auth metadata
	const role = (profile?.role ?? user.user_metadata?.role ?? 'client') as UserRole
	const userName = profile?.full_name || user.user_metadata?.full_name || user.email || 'User'

	// Redirect to onboarding if not completed
	if (!profile || !profile.onboarding_completed) {
		redirect('/onboarding')
	}

	// Check if user is a worker (has active worker records)
	const { count: workerCount } = await supabase
		.from('workers')
		.select('id', { count: 'exact', head: true })
		.eq('user_id', user.id)
		.eq('is_active', true)

	const isWorker = (workerCount ?? 0) > 0

	return (
		<div className="flex min-h-svh">
			<DashboardSidebar role={role} userName={userName} isWorker={isWorker} />
			<main className="flex-1 overflow-auto">
				<div className="mx-auto max-w-6xl px-6 py-8">
					{children}
				</div>
			</main>
		</div>
	)
}
