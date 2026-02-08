import { PageTransition } from '@/components/page-transition';
import { createClient } from '@/lib/supabase/server';
import { DiscoverClient } from './discover-client';

interface DiscoverPageProps {
	searchParams: Promise<{ category?: string; q?: string }>
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
	const params = await searchParams
	const supabase = await createClient()

	const { data: categories } = await supabase
		.from('categories')
		.select('*')
		.order('sort_order')

	let businessQuery = supabase
		.from('businesses')
		.select('*, categories(name, slug)')
		.eq('is_active', true)
		.order('rating_avg', { ascending: false })
		.limit(50)

	if (params.category && categories) {
		const cat = categories.find((c) => c.slug === params.category)
		if (cat) {
			businessQuery = businessQuery.eq('category_id', cat.id)
		}
	}

	if (params.q) {
		businessQuery = businessQuery.ilike('name', `%${params.q}%`)
	}

	const { data: businesses } = await businessQuery

	return (
		<PageTransition>
			<DiscoverClient
				categories={categories ?? []}
				initialBusinesses={businesses ?? []}
				initialCategory={params.category ?? null}
				initialQuery={params.q ?? ''}
			/>
		</PageTransition>
	)
}
