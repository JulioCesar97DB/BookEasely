'use client'

import { BusinessImageCarousel } from '@/components/business-image-carousel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { isOpenNow } from '@/lib/format'
import type { BusinessHours, BusinessWithCategory } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Clock, MapPin, Phone, Star } from 'lucide-react'
import Link from 'next/link'

interface BusinessHeroProps {
	business: BusinessWithCategory
	hours: BusinessHours[]
	bookingUrl: string
}

export function BusinessHero({ business, hours, bookingUrl }: BusinessHeroProps) {
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

	return (
		<>
			{/* Hero Section */}
			<div className="relative">
				<BusinessImageCarousel
					images={images}
					alt={business.name}
					aspectRatio="compact"
					sizes="100vw"
					showArrows
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
							<Button size="lg" asChild>
								<Link href={bookingUrl}>Book Now</Link>
							</Button>
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
		</>
	)
}
