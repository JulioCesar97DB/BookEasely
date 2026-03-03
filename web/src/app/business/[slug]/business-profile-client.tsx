'use client'

import { PageTransition } from '@/components/page-transition'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type {
	BusinessHours,
	BusinessWithCategory,
	Review,
	Service,
	Worker,
} from '@/lib/types'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Clock, Star, Users } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { BusinessHero } from './components/business-hero'
import { HoursTab } from './components/hours-tab'
import type { ReviewWithProfile } from './components/reviews-tab'
import { ReviewsTab } from './components/reviews-tab'
import { ServicesTab } from './components/services-tab'
import { TeamTab } from './components/team-tab'

interface BusinessProfileClientProps {
	business: BusinessWithCategory
	services: Service[]
	workers: Worker[]
	serviceWorkers: { service_id: string; worker_id: string }[]
	hours: BusinessHours[]
	reviews: ReviewWithProfile[]
	isAuthenticated: boolean
}

export function BusinessProfileClient({
	business,
	services,
	workers,
	serviceWorkers,
	hours,
	reviews,
	isAuthenticated,
}: BusinessProfileClientProps) {
	const [activeTab, setActiveTab] = useState('services')

	const serviceWorkerMap = useMemo(() => {
		const serviceIds = new Set(services.map((s) => s.id))
		const workerIds = new Set(workers.map((w) => w.id))
		const map = new Map<string, string[]>()
		for (const sw of serviceWorkers) {
			if (!serviceIds.has(sw.service_id) || !workerIds.has(sw.worker_id)) continue
			const existing = map.get(sw.service_id) ?? []
			existing.push(sw.worker_id)
			map.set(sw.service_id, existing)
		}
		return map
	}, [services, workers, serviceWorkers])

	const workerServiceMap = useMemo(() => {
		const serviceIds = new Set(services.map((s) => s.id))
		const workerIds = new Set(workers.map((w) => w.id))
		const map = new Map<string, string[]>()
		for (const sw of serviceWorkers) {
			if (!serviceIds.has(sw.service_id) || !workerIds.has(sw.worker_id)) continue
			const existing = map.get(sw.worker_id) ?? []
			existing.push(sw.service_id)
			map.set(sw.worker_id, existing)
		}
		return map
	}, [services, workers, serviceWorkers])

	const workersById = useMemo(() => new Map(workers.map((w) => [w.id, w])), [workers])
	const servicesById = useMemo(() => new Map(services.map((s) => [s.id, s])), [services])

	const bookingUrl = isAuthenticated
		? `/book/${business.slug}`
		: `/auth/login?next=/book/${business.slug}`

	return (
		<PageTransition>
			<BusinessHero business={business} hours={hours} bookingUrl={bookingUrl} />

			{/* Tabbed Content */}
			<div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 pb-24 sm:pb-6">
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList variant="line" className="mb-6 w-full justify-start overflow-x-auto">
						<TabsTrigger value="services" className="gap-1.5">
							<Calendar className="h-4 w-4" />
							Services
							{services.length > 0 && (
								<span className="text-xs text-muted-foreground">({services.length})</span>
							)}
						</TabsTrigger>
						<TabsTrigger value="workers" className="gap-1.5">
							<Users className="h-4 w-4" />
							Team
							{workers.length > 0 && (
								<span className="text-xs text-muted-foreground">({workers.length})</span>
							)}
						</TabsTrigger>
						<TabsTrigger value="reviews" className="gap-1.5">
							<Star className="h-4 w-4" />
							Reviews
							{reviews.length > 0 && (
								<span className="text-xs text-muted-foreground">({reviews.length})</span>
							)}
						</TabsTrigger>
						<TabsTrigger value="hours" className="gap-1.5">
							<Clock className="h-4 w-4" />
							Hours & Info
						</TabsTrigger>
					</TabsList>

					<AnimatePresence mode="wait">
						<motion.div
							key={activeTab}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.2 }}
						>
							{activeTab === 'services' && (
								<ServicesTab
									services={services}
									serviceWorkerMap={serviceWorkerMap}
									workersById={workersById}
								/>
							)}
							{activeTab === 'workers' && (
								<TeamTab
									workers={workers}
									workerServiceMap={workerServiceMap}
									servicesById={servicesById}
								/>
							)}
							{activeTab === 'reviews' && (
								<ReviewsTab reviews={reviews} business={business} />
							)}
							{activeTab === 'hours' && (
								<HoursTab hours={hours} business={business} />
							)}
						</motion.div>
					</AnimatePresence>
				</Tabs>
			</div>

			{/* Sticky Mobile Book Now */}
			<div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm p-4 sm:hidden z-40">
				<Button className="w-full" size="lg" asChild>
					<Link href={bookingUrl}>Book Now</Link>
				</Button>
			</div>
		</PageTransition>
	)
}
