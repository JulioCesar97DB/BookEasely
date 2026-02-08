import { PublicHeader } from '@/components/public-header'
import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import { SearchPageClient } from './search-client'

interface SearchPageProps {
	searchParams: Promise<{ category?: string; q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
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

	if (params.category) {
		businessQuery = businessQuery.eq('categories.slug', params.category)
	}

	if (params.q) {
		businessQuery = businessQuery.ilike('name', `%${params.q}%`)
	}

	const { data: businesses } = await businessQuery

	return (
		<div className="min-h-svh">
			<PublicHeader />
			<Suspense fallback={<SearchSkeleton />}>
				<SearchPageClient
					categories={categories ?? []}
					initialBusinesses={businesses ?? []}
					initialCategory={params.category ?? null}
					initialQuery={params.q ?? ''}
				/>
			</Suspense>
		</div>
	)
}

function SearchSkeleton() {
	return (
		<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<div className="h-12 w-full max-w-xl animate-pulse rounded-lg bg-muted" />
			<div className="mt-4 flex gap-2">
				{Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-muted" />
				))}
			</div>
			<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="animate-pulse rounded-xl border bg-card">
						<div className="aspect-video bg-muted" />
						<div className="space-y-3 p-5">
							<div className="h-5 w-3/4 rounded bg-muted" />
							<div className="h-4 w-1/2 rounded bg-muted" />
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
