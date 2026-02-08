import { getAuthUser } from '@/lib/supabase/auth-cache'
import { createClient } from '@/lib/supabase/server'
import type { Worker, WorkerAvailability, WorkerBlockedDate } from '@/lib/types'
import { redirect } from 'next/navigation'
import { MyScheduleClient } from './my-schedule-client'

interface WorkerWithBusiness extends Pick<Worker, 'id' | 'display_name' | 'business_id'> {
	businesses: { name: string } | null
}

export default async function MySchedulePage() {
	const user = await getAuthUser()
	const supabase = await createClient()

	const { data: rawWorkers } = await supabase
		.from('workers')
		.select('id, display_name, business_id, businesses(name)')
		.eq('user_id', user!.id)
		.eq('is_active', true)

	const workers: WorkerWithBusiness[] = (rawWorkers ?? []) as unknown as WorkerWithBusiness[]

	if (workers.length === 0) {
		redirect('/dashboard')
	}

	const workerIds = workers.map((w) => w.id)

	const [{ data: availability }, { data: blockedDates }] = await Promise.all([
		supabase
			.from('worker_availability')
			.select('*')
			.in('worker_id', workerIds)
			.order('day_of_week'),
		supabase
			.from('worker_blocked_dates')
			.select('*')
			.in('worker_id', workerIds)
			.order('date'),
	])

	return (
		<MyScheduleClient
			workers={workers.map((w) => ({
				id: w.id,
				display_name: w.display_name,
				business_id: w.business_id,
				business_name: w.businesses?.name ?? 'Business',
			}))}
			availability={(availability ?? []) as WorkerAvailability[]}
			blockedDates={(blockedDates ?? []) as WorkerBlockedDate[]}
		/>
	)
}
