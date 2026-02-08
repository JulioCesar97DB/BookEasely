import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { getAuthProfile, getAuthUser, getIsWorker, getUserRole } from '@/lib/supabase/auth-cache'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	// The proxy already blocks unauthenticated access to /dashboard/*.
	// This guard is a safety net only.
	const user = await getAuthUser()
	if (!user) redirect('/auth/login')

	const profile = await getAuthProfile()
	if (!profile || !profile.onboarding_completed) redirect('/onboarding')

	const [role, isWorker] = await Promise.all([
		getUserRole(),
		getIsWorker(),
	])

	const userName = profile.full_name || user.user_metadata?.full_name || user.email || 'User'

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
