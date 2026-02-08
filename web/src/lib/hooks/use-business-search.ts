'use client'

import { createClient } from '@/lib/supabase/client'
import type { BusinessWithCategory, Category } from '@/lib/types'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseBusinessSearchOptions {
	categories: Category[]
	initialBusinesses: BusinessWithCategory[]
	initialCategory: string | null
	initialQuery: string
}

export function useBusinessSearch({
	categories,
	initialBusinesses,
	initialCategory,
	initialQuery,
}: UseBusinessSearchOptions) {
	const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory)
	const [searchQuery, setSearchQuery] = useState(initialQuery)
	const [businesses, setBusinesses] = useState<BusinessWithCategory[]>(initialBusinesses)
	const [isLoading, setIsLoading] = useState(false)
	const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)
	const isFirstRender = useRef(true)
	const categoriesRef = useRef(categories)
	useEffect(() => {
		categoriesRef.current = categories
	}, [categories])

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
			const cat = categoriesRef.current.find((c) => c.slug === category)
			if (cat) {
				q = q.eq('category_id', cat.id)
			}
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

	const toggleCategory = useCallback((slug: string) => {
		setSelectedCategory((prev) => (prev === slug ? null : slug))
	}, [])

	const clearFilters = useCallback(() => {
		setSearchQuery('')
		setSelectedCategory(null)
	}, [])

	return {
		businesses,
		isLoading,
		searchQuery,
		setSearchQuery,
		selectedCategory,
		setSelectedCategory,
		toggleCategory,
		clearFilters,
		hasActiveFilters: !!selectedCategory || !!searchQuery.trim(),
	}
}
