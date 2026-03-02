import { PublicHeader } from '@/components/public-header'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { BookingFlow } from './booking-flow'

interface BookPageProps {
	params: Promise<{ slug: string }>
}

export default async function BookPage({ params }: BookPageProps) {
	const { slug } = await params
	const supabase = await createClient()

	const { data: { user } } = await supabase.auth.getUser()
	if (!user) {
		redirect(`/auth/login?next=/book/${slug}`)
	}

	const { data: business } = await supabase
		.from('businesses')
		.select('*, categories(name, slug)')
		.eq('slug', slug)
		.eq('is_active', true)
		.single()

	if (!business) notFound()

	const [{ data: services }, { data: workers }, { data: serviceWorkers }] = await Promise.all([
		supabase
			.from('services')
			.select('*')
			.eq('business_id', business.id)
			.eq('is_active', true)
			.order('price'),
		supabase
			.from('workers')
			.select('*')
			.eq('business_id', business.id)
			.eq('is_active', true)
			.order('display_name'),
		supabase
			.from('service_workers')
			.select('service_id, worker_id'),
	])

	return (
		<div className="min-h-svh bg-muted/30">
			<PublicHeader />
			<BookingFlow
				business={business}
				services={services ?? []}
				workers={workers ?? []}
				serviceWorkers={serviceWorkers ?? []}
			/>
		</div>
	)
}
