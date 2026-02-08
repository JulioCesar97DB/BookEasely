'use client'

import { BusinessCard } from '@/components/business-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useBusinessSearch } from '@/lib/hooks/use-business-search'
import type { BusinessWithCategory, Category } from '@/lib/types'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X } from 'lucide-react'

interface Props {
	categories: Category[]
	initialBusinesses: BusinessWithCategory[]
	initialCategory: string | null
	initialQuery: string
}

export function DiscoverClient({
	categories,
	initialBusinesses,
	initialCategory,
	initialQuery,
}: Props) {
	const {
		businesses,
		isLoading,
		searchQuery,
		setSearchQuery,
		selectedCategory,
		toggleCategory,
		setSelectedCategory,
		clearFilters,
		hasActiveFilters,
	} = useBusinessSearch({ categories, initialBusinesses, initialCategory, initialQuery })

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Discover</h1>
				<p className="mt-1 text-muted-foreground">
					Find and book services from local businesses
				</p>
			</div>

			{/* Search bar */}
			<div className="relative max-w-2xl">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search businesses by name..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="h-11 pl-10 pr-10"
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
			<div className="flex flex-wrap gap-2">
				<button
					onClick={() => setSelectedCategory(null)}
					className={cn(
						'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
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
							'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
							selectedCategory === cat.slug
								? 'border-primary bg-primary text-primary-foreground'
								: 'border-border bg-card text-foreground hover:bg-accent'
						)}
					>
						{cat.name}
					</button>
				))}
			</div>

			{/* Results info */}
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{isLoading
						? 'Searching...'
						: `${businesses.length} ${businesses.length === 1 ? 'business' : 'businesses'} found`}
				</p>
				{hasActiveFilters && (
					<Button variant="ghost" size="sm" onClick={clearFilters}>
						Clear filters
					</Button>
				)}
			</div>

			{/* Business grid */}
			<AnimatePresence mode="wait">
				{businesses.length > 0 ? (
					<motion.div
						key="results"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
					>
						{businesses.map((business, i) => (
							<motion.div
								key={business.id}
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: i * 0.04, duration: 0.3 }}
							>
								<BusinessCard business={business} />
							</motion.div>
						))}
					</motion.div>
				) : !isLoading ? (
					<motion.div
						key="empty"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center"
					>
						<Search className="h-10 w-10 text-muted-foreground/30" />
						<h3 className="mt-4 font-semibold">No businesses found</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							Try adjusting your search or filters
						</p>
						<Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
							Clear filters
						</Button>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	)
}
