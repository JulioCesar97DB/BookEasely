'use client'

import { AnimatedCard } from '@/components/animated-cards'
import { BusinessImageCarousel } from '@/components/business-image-carousel'
import { PageTransition } from '@/components/page-transition'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type {
	BusinessHours,
	BusinessWithCategory,
	Review,
	Service,
	Worker,
} from '@/lib/types'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
	Calendar,
	Clock,
	Globe,
	Mail,
	MapPin,
	MessageSquare,
	Phone,
	Star,
	User,
	Users,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

interface ReviewWithProfile extends Review {
	profiles: { full_name: string; avatar_url: string | null } | null
}

interface BusinessProfileClientProps {
	business: BusinessWithCategory
	services: Service[]
	workers: Worker[]
	serviceWorkers: { service_id: string; worker_id: string }[]
	hours: BusinessHours[]
	reviews: ReviewWithProfile[]
	isAuthenticated: boolean
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatTime(time: string) {
	const [h, m] = time.split(':').map(Number)
	const ampm = h >= 12 ? 'PM' : 'AM'
	const hour = h % 12 || 12
	return m === 0 ? `${hour} ${ampm}` : `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

function formatDuration(minutes: number) {
	if (minutes < 60) return `${minutes}min`
	const h = Math.floor(minutes / 60)
	const m = minutes % 60
	return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function getInitials(name: string) {
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)
}

function isOpenNow(hours: BusinessHours[]) {
	const now = new Date()
	const today = now.getDay()
	const todayHours = hours.find((h) => h.day_of_week === today)
	if (!todayHours || todayHours.is_closed) return false

	const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
	return currentTime >= todayHours.open_time && currentTime < todayHours.close_time
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

	const images = business.photos?.length
		? business.photos
		: business.cover_image_url
			? [business.cover_image_url]
			: []

	const location = [business.city, business.state].filter(Boolean).join(', ')
	const fullAddress = [business.address, business.city, business.state, business.zip_code]
		.filter(Boolean)
		.join(', ')
	const open = isOpenNow(hours)

	// Build service → workers map
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

	// Build worker → services map
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

	const workersById = useMemo(
		() => new Map(workers.map((w) => [w.id, w])),
		[workers]
	)
	const servicesById = useMemo(
		() => new Map(services.map((s) => [s.id, s])),
		[services]
	)

	const bookingUrl = isAuthenticated
		? undefined
		: `/auth/login?next=/business/${business.slug}`

	function handleBookNow() {
		if (isAuthenticated) {
			toast.info('Booking flow coming soon!')
		}
	}

	return (
		<PageTransition>
			{/* Hero Section */}
			<div className="relative">
				<BusinessImageCarousel
					images={images}
					alt={business.name}
					aspectRatio="compact"
					sizes="100vw"
				/>
				<div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

				<div className="absolute bottom-0 left-0 right-0 px-4 pb-6 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-5xl">
						{business.categories?.name && (
							<Badge
								variant="secondary"
								className="mb-2 bg-white/15 text-white backdrop-blur-sm border-white/20 text-xs"
							>
								{business.categories.name}
							</Badge>
						)}
						<h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl tracking-tight">
							{business.name}
						</h1>
						<div className="mt-2 flex flex-wrap items-center gap-3 text-white/90">
							{business.rating_count > 0 ? (
								<div className="flex items-center gap-1">
									<Star className="h-4 w-4 fill-amber-400 text-amber-400" />
									<span className="font-semibold">
										{Number(business.rating_avg).toFixed(1)}
									</span>
									<span className="text-white/60">
										({business.rating_count} {business.rating_count === 1 ? 'review' : 'reviews'})
									</span>
								</div>
							) : (
								<span className="text-sm text-white/60">No reviews yet</span>
							)}
							{location && (
								<>
									<span className="text-white/30">|</span>
									<div className="flex items-center gap-1 text-sm">
										<MapPin className="h-3.5 w-3.5" />
										{location}
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Info Bar */}
			<div className="border-b bg-background">
				<div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
							{business.phone && (
								<a
									href={`tel:${business.phone}`}
									className="flex items-center gap-1.5 hover:text-foreground transition-colors"
								>
									<Phone className="h-3.5 w-3.5" />
									{business.phone}
								</a>
							)}
							{fullAddress && (
								<span className="flex items-center gap-1.5">
									<MapPin className="h-3.5 w-3.5" />
									<span className="hidden sm:inline">{fullAddress}</span>
									<span className="sm:hidden">{location}</span>
								</span>
							)}
							<Badge
								variant="outline"
								className={cn(
									'text-xs font-medium',
									open
										? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400'
										: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400'
								)}
							>
								{open ? 'Open now' : 'Closed'}
							</Badge>
							{business.auto_confirm && (
								<Badge
									variant="outline"
									className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400 text-xs"
								>
									<Clock className="h-3 w-3 mr-1" />
									Instant booking
								</Badge>
							)}
						</div>
						<div className="hidden sm:block">
							{isAuthenticated ? (
								<Button size="lg" onClick={handleBookNow}>
									Book Now
								</Button>
							) : (
								<Button size="lg" asChild>
									<Link href={bookingUrl!}>Book Now</Link>
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Description */}
			{business.description && (
				<div className="border-b bg-muted/30">
					<div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
						<p className="text-sm text-muted-foreground leading-relaxed">
							{business.description}
						</p>
					</div>
				</div>
			)}

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
								<WorkersTab
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
				{isAuthenticated ? (
					<Button className="w-full" size="lg" onClick={handleBookNow}>
						Book Now
					</Button>
				) : (
					<Button className="w-full" size="lg" asChild>
						<Link href={bookingUrl!}>Book Now</Link>
					</Button>
				)}
			</div>
		</PageTransition>
	)
}

/* ─── Services Tab ─────────────────────────────────────────── */

function ServicesTab({
	services,
	serviceWorkerMap,
	workersById,
}: {
	services: Service[]
	serviceWorkerMap: Map<string, string[]>
	workersById: Map<string, Worker>
}) {
	if (services.length === 0) {
		return (
			<EmptyState
				icon={Calendar}
				title="No services listed"
				description="This business hasn't added any services yet."
			/>
		)
	}

	return (
		<div className="space-y-3">
			{services.map((service, i) => {
				const workerIds = serviceWorkerMap.get(service.id) ?? []
				const assignedWorkers = workerIds
					.map((id) => workersById.get(id))
					.filter(Boolean) as Worker[]

				return (
					<AnimatedCard key={service.id} delay={i * 0.05}>
						<Card className="py-0">
							<CardContent className="p-4">
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1 min-w-0">
										<h3 className="font-semibold text-sm">{service.name}</h3>
										{service.description && (
											<p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
												{service.description}
											</p>
										)}
										<div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
											<span className="flex items-center gap-1">
												<Clock className="h-3 w-3" />
												{formatDuration(service.duration_minutes)}
											</span>
											{assignedWorkers.length > 0 && (
												<div className="flex items-center gap-1">
													<span>with</span>
													<div className="flex -space-x-1.5">
														{assignedWorkers.slice(0, 3).map((w) => (
															<Avatar
																key={w.id}
																className="h-5 w-5 border-2 border-background"
															>
																<AvatarImage src={w.avatar_url ?? undefined} />
																<AvatarFallback className="text-[8px]">
																	{getInitials(w.display_name)}
																</AvatarFallback>
															</Avatar>
														))}
													</div>
													{assignedWorkers.length > 3 && (
														<span>+{assignedWorkers.length - 3}</span>
													)}
												</div>
											)}
										</div>
									</div>
									<div className="text-right shrink-0">
										<p className="font-semibold text-sm">
											${Number(service.price).toFixed(0)}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</AnimatedCard>
				)
			})}
		</div>
	)
}

/* ─── Workers Tab ──────────────────────────────────────────── */

function WorkersTab({
	workers,
	workerServiceMap,
	servicesById,
}: {
	workers: Worker[]
	workerServiceMap: Map<string, string[]>
	servicesById: Map<string, Service>
}) {
	if (workers.length === 0) {
		return (
			<EmptyState
				icon={Users}
				title="No team members"
				description="This business hasn't added any team members yet."
			/>
		)
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{workers.map((worker, i) => {
				const serviceIds = workerServiceMap.get(worker.id) ?? []
				const assignedServices = serviceIds
					.map((id) => servicesById.get(id))
					.filter(Boolean) as Service[]

				return (
					<AnimatedCard key={worker.id} delay={i * 0.05}>
						<Card className="py-0 h-full">
							<CardContent className="p-4">
								<div className="flex items-start gap-3">
									<Avatar className="h-12 w-12 shrink-0">
										<AvatarImage src={worker.avatar_url ?? undefined} />
										<AvatarFallback className="text-sm font-medium">
											{getInitials(worker.display_name)}
										</AvatarFallback>
									</Avatar>
									<div className="min-w-0">
										<h3 className="font-semibold text-sm">{worker.display_name}</h3>
										{worker.bio && (
											<p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
												{worker.bio}
											</p>
										)}
									</div>
								</div>

								{worker.specialties && worker.specialties.length > 0 && (
									<div className="mt-3 flex flex-wrap gap-1.5">
										{worker.specialties.map((s) => (
											<Badge
												key={s}
												variant="secondary"
												className="text-[10px] px-1.5 py-0"
											>
												{s}
											</Badge>
										))}
									</div>
								)}

								{assignedServices.length > 0 && (
									<>
										<Separator className="my-3" />
										<div>
											<p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
												Services
											</p>
											<p className="text-xs text-muted-foreground line-clamp-2">
												{assignedServices.map((s) => s.name).join(', ')}
											</p>
										</div>
									</>
								)}
							</CardContent>
						</Card>
					</AnimatedCard>
				)
			})}
		</div>
	)
}

/* ─── Reviews Tab ──────────────────────────────────────────── */

function ReviewsTab({
	reviews,
	business,
}: {
	reviews: ReviewWithProfile[]
	business: BusinessWithCategory
}) {
	if (reviews.length === 0) {
		return (
			<EmptyState
				icon={MessageSquare}
				title="No reviews yet"
				description="Be the first to leave a review after your appointment."
			/>
		)
	}

	return (
		<div className="space-y-6">
			{/* Rating Summary */}
			<AnimatedCard>
				<Card className="py-0">
					<CardContent className="p-5">
						<div className="flex items-center gap-6">
							<div className="text-center">
								<p className="text-4xl font-bold tracking-tight">
									{Number(business.rating_avg).toFixed(1)}
								</p>
								<div className="mt-1 flex items-center gap-0.5">
									{Array.from({ length: 5 }).map((_, i) => (
										<Star
											key={i}
											className={cn(
												'h-3.5 w-3.5',
												i < Math.round(Number(business.rating_avg))
													? 'fill-amber-400 text-amber-400'
													: 'text-muted-foreground/30'
											)}
										/>
									))}
								</div>
								<p className="mt-1 text-xs text-muted-foreground">
									{business.rating_count} {business.rating_count === 1 ? 'review' : 'reviews'}
								</p>
							</div>
							<Separator orientation="vertical" className="h-16" />
							<div className="flex-1 space-y-1">
								{[5, 4, 3, 2, 1].map((rating) => {
									const count = reviews.filter((r) => r.rating === rating).length
									const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
									return (
										<div key={rating} className="flex items-center gap-2 text-xs">
											<span className="w-2 text-muted-foreground">{rating}</span>
											<Star className="h-3 w-3 fill-amber-400 text-amber-400" />
											<div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
												<div
													className="h-full rounded-full bg-amber-400 transition-all"
													style={{ width: `${pct}%` }}
												/>
											</div>
											<span className="w-4 text-right text-muted-foreground">{count}</span>
										</div>
									)
								})}
							</div>
						</div>
					</CardContent>
				</Card>
			</AnimatedCard>

			{/* Individual Reviews */}
			<div className="space-y-4">
				{reviews.map((review, i) => (
					<AnimatedCard key={review.id} delay={(i + 1) * 0.05}>
						<Card className="py-0">
							<CardContent className="p-4">
								<div className="flex items-start gap-3">
									<Avatar className="h-9 w-9 shrink-0">
										<AvatarImage src={review.profiles?.avatar_url ?? undefined} />
										<AvatarFallback className="text-xs">
											{review.profiles
												? getInitials(review.profiles.full_name)
												: <User className="h-4 w-4" />}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between gap-2">
											<p className="text-sm font-medium">
												{review.profiles?.full_name ?? 'Anonymous'}
											</p>
											<time className="text-[11px] text-muted-foreground shrink-0">
												{new Date(review.created_at).toLocaleDateString('en-US', {
													month: 'short',
													day: 'numeric',
													year: 'numeric',
												})}
											</time>
										</div>
										<div className="mt-0.5 flex items-center gap-0.5">
											{Array.from({ length: 5 }).map((_, j) => (
												<Star
													key={j}
													className={cn(
														'h-3 w-3',
														j < review.rating
															? 'fill-amber-400 text-amber-400'
															: 'text-muted-foreground/30'
													)}
												/>
											))}
										</div>
										{review.comment && (
											<p className="mt-2 text-sm text-muted-foreground leading-relaxed">
												{review.comment}
											</p>
										)}
										{review.business_response && (
											<div className="mt-3 rounded-lg bg-muted/50 p-3 border-l-2 border-primary/30">
												<p className="text-[11px] font-medium text-muted-foreground mb-1">
													Business response
												</p>
												<p className="text-xs text-muted-foreground leading-relaxed">
													{review.business_response}
												</p>
											</div>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					</AnimatedCard>
				))}
			</div>
		</div>
	)
}

/* ─── Hours & Location Tab ─────────────────────────────────── */

function HoursTab({
	hours,
	business,
}: {
	hours: BusinessHours[]
	business: BusinessWithCategory
}) {
	const today = new Date().getDay()
	const fullAddress = [business.address, business.city, business.state, business.zip_code]
		.filter(Boolean)
		.join(', ')

	return (
		<div className="grid gap-6 lg:grid-cols-2">
			{/* Hours */}
			<AnimatedCard>
				<Card className="py-0">
					<CardContent className="p-5">
						<h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
							<Clock className="h-4 w-4 text-muted-foreground" />
							Business Hours
						</h3>
						<div className="space-y-1">
							{DAYS.map((day, i) => {
								const dayHours = hours.find((h) => h.day_of_week === i)
								const isToday = i === today
								return (
									<div
										key={day}
										className={cn(
											'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
											isToday && 'bg-primary/5 font-medium'
										)}
									>
										<span className="flex items-center gap-2">
											{isToday && (
												<span className="h-1.5 w-1.5 rounded-full bg-primary" />
											)}
											<span className={cn(!isToday && 'ml-3.5')}>
												{SHORT_DAYS[i]}
											</span>
										</span>
										<span
											className={cn(
												!isToday && 'text-muted-foreground',
												dayHours?.is_closed && 'text-muted-foreground/50'
											)}
										>
											{!dayHours || dayHours.is_closed
												? 'Closed'
												: `${formatTime(dayHours.open_time)} - ${formatTime(dayHours.close_time)}`}
										</span>
									</div>
								)
							})}
						</div>
					</CardContent>
				</Card>
			</AnimatedCard>

			{/* Contact & Location */}
			<AnimatedCard delay={0.05}>
				<Card className="py-0 h-full">
					<CardContent className="p-5">
						<h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
							<MapPin className="h-4 w-4 text-muted-foreground" />
							Contact & Location
						</h3>
						<div className="space-y-3">
							{fullAddress && (
								<div className="flex items-start gap-3 text-sm">
									<MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
									<span>{fullAddress}</span>
								</div>
							)}
							{business.phone && (
								<div className="flex items-center gap-3 text-sm">
									<Phone className="h-4 w-4 text-muted-foreground shrink-0" />
									<a
										href={`tel:${business.phone}`}
										className="hover:text-primary transition-colors"
									>
										{business.phone}
									</a>
								</div>
							)}
							{business.email && (
								<div className="flex items-center gap-3 text-sm">
									<Mail className="h-4 w-4 text-muted-foreground shrink-0" />
									<a
										href={`mailto:${business.email}`}
										className="hover:text-primary transition-colors"
									>
										{business.email}
									</a>
								</div>
							)}
							{business.website && (
								<div className="flex items-center gap-3 text-sm">
									<Globe className="h-4 w-4 text-muted-foreground shrink-0" />
									<a
										href={business.website}
										target="_blank"
										rel="noopener noreferrer"
										className="hover:text-primary transition-colors truncate"
									>
										{business.website.replace(/^https?:\/\//, '')}
									</a>
								</div>
							)}

							{business.cancellation_policy && (
								<>
									<Separator className="my-2" />
									<div>
										<p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
											Cancellation Policy
										</p>
										<p className="text-xs text-muted-foreground leading-relaxed">
											{business.cancellation_policy}
										</p>
										{business.cancellation_hours > 0 && (
											<p className="mt-1 text-xs text-muted-foreground">
												Cancel at least {business.cancellation_hours}h in advance.
											</p>
										)}
									</div>
								</>
							)}
						</div>
					</CardContent>
				</Card>
			</AnimatedCard>
		</div>
	)
}

/* ─── Empty State ──────────────────────────────────────────── */

function EmptyState({
	icon: Icon,
	title,
	description,
}: {
	icon: React.ComponentType<{ className?: string }>
	title: string
	description: string
}) {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<div className="rounded-full bg-muted p-4 mb-4">
				<Icon className="h-6 w-6 text-muted-foreground" />
			</div>
			<h3 className="font-medium text-sm">{title}</h3>
			<p className="mt-1 text-xs text-muted-foreground max-w-xs">{description}</p>
		</div>
	)
}
