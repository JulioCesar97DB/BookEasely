import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { MobileHeader } from '@/components/mobile-header'
import { getAuthProfile, getAuthUser, getIsWorker, getUnreadNotificationCount, getUserRole } from '@/lib/supabase/auth-cache'
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

	const [role, isWorker, unreadCount] = await Promise.all([
		getUserRole(),
		getIsWorker(),
		getUnreadNotificationCount(),
	])

	const userName = profile.full_name || user.user_metadata?.full_name || user.email || 'User'

	return (
		<div className="flex flex-col md:flex-row h-svh overflow-hidden">
			<MobileHeader role={role} userName={userName} isWorker={isWorker} unreadCount={unreadCount} />
			<DashboardSidebar role={role} userName={userName} isWorker={isWorker} unreadCount={unreadCount} />
			<main className="flex-1 overflow-y-auto">
				<div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
					{children}
				</div>
			</main>
		</div>
	)
}
