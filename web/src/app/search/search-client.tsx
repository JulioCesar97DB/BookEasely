'use client'

import { BusinessCard } from '@/components/business-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useBusinessSearch } from '@/lib/hooks/use-business-search'
import type { BusinessWithCategory, Category } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'

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
	const isFirstUrlUpdate = useRef(true)

	const {
		businesses,
		isLoading,
		searchQuery,
		setSearchQuery,
		selectedCategory,
		setSelectedCategory,
		toggleCategory,
		clearFilters,
	} = useBusinessSearch({ categories, initialBusinesses, initialCategory, initialQuery })

	// Sync URL with filter state (shallow, no re-render loop)
	useEffect(() => {
		if (isFirstUrlUpdate.current) {
			isFirstUrlUpdate.current = false
			return
		}

		const params = new URLSearchParams()
		if (selectedCategory) params.set('category', selectedCategory)
		if (searchQuery.trim()) params.set('q', searchQuery.trim())
		const newUrl = params.toString() ? `/search?${params}` : '/search'
		router.replace(newUrl, { scroll: false })
	}, [selectedCategory, searchQuery, router])

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
						onClick={() => toggleCategory(cat.slug)}
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
				<div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
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
					<Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
						Clear filters
					</Button>
				</div>
			) : null}
		</div>
	)
}

export function SearchPageClient(props: Props) {
	return (
		<Suspense>
			<SearchPageInner {...props} />
		</Suspense>
	)
}
