import { getAuthProfile, getAuthUser, getIsWorker, getUserRole } from '@/lib/supabase/auth-cache'
import { BusinessOwnerDashboard } from './components/business-owner-dashboard'
import { ClientDashboard } from './components/client-dashboard'
import { WorkerDashboard } from './components/worker-dashboard'

export default async function DashboardPage() {
	const [user, profile, role, isWorker] = await Promise.all([
		getAuthUser(),
		getAuthProfile(),
		getUserRole(),
		getIsWorker(),
	])

	const userId = user!.id
	const firstName = (profile?.full_name || user?.user_metadata?.full_name || '').split(' ')[0] || 'there'

	if (role === 'business_owner') {
		return <BusinessOwnerDashboard firstName={firstName} userId={userId} />
	}

	if (isWorker) {
		return <WorkerDashboard firstName={firstName} userId={userId} />
	}

	return <ClientDashboard firstName={firstName} userId={userId} />
}
