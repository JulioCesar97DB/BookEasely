'use client'

import { BusinessImageCarousel } from '@/components/business-image-carousel'
import { MapPin, Search, Star, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import type { Business, Category } from '@/lib/types'
import { cn } from '@/lib/utils'

interface BusinessWithCategory extends Business {
	categories?: { name: string; slug: string } | null
}

interface Props {
	categories: Category[]
	initialBusinesses: BusinessWithCategory[]
	initialCategory: string | null
	initialQuery: string
}

function SearchPageInner({
	categories,
	initialBusinesses,
	initialCategory,
	initialQuery,
}: Props) {
	const router = useRouter()
	const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory)
	const [searchQuery, setSearchQuery] = useState(initialQuery)
	const [businesses, setBusinesses] = useState<BusinessWithCategory[]>(initialBusinesses)
	const [isLoading, setIsLoading] = useState(false)
	const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)
	const isFirstRender = useRef(true)

	const fetchBusinesses = useCallback(async (category: string | null, query: string) => {
		setIsLoading(true)
		const supabase = createClient()
		let q = supabase
			.from('businesses')
			.select('*, categories(name, slug)')
			.eq('is_active', true)
			.order('rating_avg', { ascending: false })
			.limit(50)

		if (category) {
			q = q.eq('categories.slug', category)
		}
		if (query.trim()) {
			q = q.ilike('name', `%${query.trim()}%`)
		}

		const { data } = await q
		setBusinesses(data ?? [])
		setIsLoading(false)
	}, [])

	useEffect(() => {
		// Skip refetch on first render — we already have server data
		if (isFirstRender.current) {
			isFirstRender.current = false
			return
		}

		const params = new URLSearchParams()
		if (selectedCategory) params.set('category', selectedCategory)
		if (searchQuery.trim()) params.set('q', searchQuery.trim())
		const newUrl = params.toString() ? `/search?${params}` : '/search'
		router.replace(newUrl, { scroll: false })

		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => {
			fetchBusinesses(selectedCategory, searchQuery)
		}, 300)

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current)
		}
	}, [selectedCategory, searchQuery, router, fetchBusinesses])

	return (
		<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			{/* Search bar */}
			<div className="relative max-w-xl">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search businesses..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="h-12 pl-10 pr-10 text-base"
				/>
				{searchQuery && (
					<button
						onClick={() => setSearchQuery('')}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
					>
						<X className="h-4 w-4" />
					</button>
				)}
			</div>

			{/* Category chips */}
			<div className="mt-4 flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
				<button
					onClick={() => setSelectedCategory(null)}
					className={cn(
						'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
						!selectedCategory
							? 'border-primary bg-primary text-primary-foreground'
							: 'border-border bg-card text-foreground hover:bg-accent'
					)}
				>
					All
				</button>
				{categories.map((cat) => (
					<button
						key={cat.id}
						onClick={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)}
						className={cn(
							'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
							selectedCategory === cat.slug
								? 'border-primary bg-primary text-primary-foreground'
								: 'border-border bg-card text-foreground hover:bg-accent'
						)}
					>
						{cat.name}
					</button>
				))}
			</div>

			{/* Results count */}
			<div className="mt-6 mb-4">
				<p className="text-sm text-muted-foreground">
					{isLoading ? 'Searching...' : (
						<>
							{businesses.length} {businesses.length === 1 ? 'business' : 'businesses'} found
							{selectedCategory && ` in ${categories.find(c => c.slug === selectedCategory)?.name}`}
							{searchQuery.trim() && ` matching "${searchQuery.trim()}"`}
						</>
					)}
				</p>
			</div>

			{/* Business grid */}
			{businesses.length > 0 ? (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{businesses.map((business) => (
						<BusinessCard key={business.id} business={business} />
					))}
				</div>
			) : !isLoading ? (
				<div className="flex flex-col items-center justify-center py-20 text-center">
					<Search className="h-12 w-12 text-muted-foreground/30" />
					<h3 className="mt-4 text-lg font-semibold">No businesses found</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Try adjusting your search or filter to find what you&apos;re looking for
					</p>
					<Button
						variant="outline"
						size="sm"
						className="mt-4"
						onClick={() => { setSearchQuery(''); setSelectedCategory(null) }}
					>
						Clear filters
					</Button>
				</div>
			) : null}
		</div>
	)
}

function BusinessCard({ business }: { business: BusinessWithCategory }) {
	return (
		<Link
			href={`/business/${business.slug}`}
			className="group overflow-hidden rounded-xl border bg-card transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
		>
			<BusinessImageCarousel
				images={business.photos?.length ? business.photos : (business.cover_image_url ? [business.cover_image_url] : [])}
				alt={business.name}
				aspectRatio="video"
				sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
			/>

			<div className="p-5">
				<div className="flex items-start justify-between">
					<div className="min-w-0 flex-1">
						<h3 className="truncate font-semibold group-hover:text-primary transition-colors">
							{business.name}
						</h3>
						<p className="mt-0.5 text-sm text-muted-foreground">
							{business.categories?.name ?? 'Uncategorized'}
						</p>
					</div>
					{business.rating_count > 0 && (
						<div className="ml-3 flex items-center gap-1 rounded-md bg-primary/5 px-2 py-1">
							<Star className="h-3.5 w-3.5 fill-primary text-primary" />
							<span className="text-sm font-semibold text-primary">
								{Number(business.rating_avg).toFixed(1)}
							</span>
						</div>
					)}
				</div>

				<div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
					{(business.city || business.state) && (
						<span className="flex items-center gap-1">
							<MapPin className="h-3.5 w-3.5" />
							{[business.city, business.state].filter(Boolean).join(', ')}
						</span>
					)}
				</div>
			</div>
		</Link>
	)
}

export function SearchPageClient(props: Props) {
	return (
		<Suspense>
			<SearchPageInner {...props} />
		</Suspense>
	)
}
