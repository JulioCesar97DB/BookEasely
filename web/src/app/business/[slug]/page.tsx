import { PublicHeader } from '@/components/public-header'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BusinessProfileClient } from './business-profile-client'

interface BusinessProfilePageProps {
	params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BusinessProfilePageProps): Promise<Metadata> {
	const { slug } = await params
	const supabase = await createClient()
	const { data: business } = await supabase
		.from('businesses')
		.select('name, description, city, state, cover_image_url')
		.eq('slug', slug)
		.eq('is_active', true)
		.single()

	if (!business) {
		return { title: 'Business Not Found | BookEasely' }
	}

	const location = [business.city, business.state].filter(Boolean).join(', ')
	return {
		title: `${business.name} | BookEasely`,
		description:
			business.description ||
			`Book appointments at ${business.name}${location ? ` in ${location}` : ''}`,
		openGraph: {
			title: business.name,
			description:
				business.description || `Book appointments at ${business.name}`,
			images: business.cover_image_url ? [{ url: business.cover_image_url }] : [],
		},
	}
}

export default async function BusinessProfilePage({ params }: BusinessProfilePageProps) {
	const { slug } = await params
	const supabase = await createClient()

	const { data: business } = await supabase
		.from('businesses')
		.select('*, categories(name, slug)')
		.eq('slug', slug)
		.eq('is_active', true)
		.single()

	if (!business) {
		notFound()
	}

	const [
		{ data: services },
		{ data: workers },
		{ data: serviceWorkers },
		{ data: hours },
		{ data: reviews },
		{ data: { user } },
	] = await Promise.all([
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
		supabase
			.from('business_hours')
			.select('*')
			.eq('business_id', business.id)
			.order('day_of_week'),
		supabase
			.from('reviews')
			.select('*, profiles:client_id(full_name, avatar_url)')
			.eq('business_id', business.id)
			.order('created_at', { ascending: false })
			.limit(20),
		supabase.auth.getUser(),
	])

	return (
		<div className="min-h-svh">
			<PublicHeader />
			<BusinessProfileClient
				business={business}
				services={services ?? []}
				workers={workers ?? []}
				serviceWorkers={serviceWorkers ?? []}
				hours={hours ?? []}
				reviews={reviews ?? []}
				isAuthenticated={!!user}
			/>
		</div>
	)
}
