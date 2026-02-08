'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import type { Business, Category } from '@/lib/types'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { MapPin, Search, Star, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

interface BusinessWithCategory extends Business {
	categories?: { name: string; slug: string } | null
}

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
		if (isFirstRender.current) {
			isFirstRender.current = false
			return
		}

		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => {
			fetchBusinesses(selectedCategory, searchQuery)
		}, 300)

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current)
		}
	}, [selectedCategory, searchQuery, fetchBusinesses])

	return (
		<div className="space-y-6">
			{/* Header */}
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
						onClick={() =>
							setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)
						}
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
				{(selectedCategory || searchQuery.trim()) && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							setSearchQuery('')
							setSelectedCategory(null)
						}}
					>
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
						className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
					>
						{businesses.map((business, i) => (
							<motion.div
								key={business.id}
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: i * 0.04, duration: 0.3 }}
							>
								<DiscoverCard business={business} />
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
						<Button
							variant="outline"
							size="sm"
							className="mt-4"
							onClick={() => {
								setSearchQuery('')
								setSelectedCategory(null)
							}}
						>
							Clear filters
						</Button>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	)
}

function DiscoverCard({ business }: { business: BusinessWithCategory }) {
	return (
		<Link
			href={`/business/${business.slug}`}
			className="group flex gap-4 rounded-xl border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
		>
			{/* Thumbnail */}
			<div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
				{business.cover_image_url ? (
					<Image
						src={business.cover_image_url}
						alt={business.name}
						fill
						sizes="80px"
						className="object-cover"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
						<Search className="h-5 w-5" />
					</div>
				)}
			</div>

			{/* Info */}
			<div className="min-w-0 flex-1">
				<div className="flex items-start justify-between gap-2">
					<h3 className="truncate font-semibold group-hover:text-primary transition-colors">
						{business.name}
					</h3>
					{business.rating_count > 0 && (
						<div className="flex shrink-0 items-center gap-1">
							<Star className="h-3.5 w-3.5 fill-primary text-primary" />
							<span className="text-sm font-medium">
								{Number(business.rating_avg).toFixed(1)}
							</span>
						</div>
					)}
				</div>

				<div className="mt-1 flex items-center gap-2">
					{business.categories?.name && (
						<Badge variant="secondary" className="text-xs font-normal">
							{business.categories.name}
						</Badge>
					)}
				</div>

				{(business.city || business.state) && (
					<p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
						<MapPin className="h-3 w-3" />
						{[business.city, business.state].filter(Boolean).join(', ')}
					</p>
				)}
			</div>
		</Link>
	)
}
