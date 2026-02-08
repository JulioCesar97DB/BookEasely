import { getAuthProfile, getAuthUser, getUserBusiness } from '@/lib/supabase/auth-cache'
import { createClient } from '@/lib/supabase/server'
import { WorkersClient } from './workers-client'

export default async function WorkersPage() {
	const business = await getUserBusiness()

	if (!business) {
		return (
			<div className="flex flex-col items-center justify-center py-20 text-center">
				<h2 className="text-xl font-semibold">No business found</h2>
				<p className="mt-2 text-muted-foreground">
					Complete onboarding to set up your business first.
				</p>
			</div>
		)
	}

	const supabase = await createClient()
	const [user, profile] = await Promise.all([getAuthUser(), getAuthProfile()])

	const [
		{ data: workers },
		{ data: availability },
		{ data: blockedDates },
		{ data: pendingInvitations },
		{ data: serviceWorkers },
	] = await Promise.all([
		supabase.from('workers').select('*').eq('business_id', business.id).order('created_at'),
		supabase.from('worker_availability').select('*'),
		supabase.from('worker_blocked_dates').select('*').order('date'),
		supabase.from('worker_invitations').select('*').eq('business_id', business.id).eq('status', 'pending').order('created_at'),
		supabase.from('service_workers').select('*'),
	])

	const ownerIsWorker = workers?.some((w) => w.user_id === user?.id) ?? false

	return (
		<WorkersClient
			businessId={business.id}
			userName={profile?.full_name ?? ''}
			workers={workers ?? []}
			availability={availability ?? []}
			blockedDates={blockedDates ?? []}
			serviceWorkers={serviceWorkers ?? []}
			pendingInvitations={pendingInvitations ?? []}
			ownerIsWorker={ownerIsWorker}
		/>
	)
}
