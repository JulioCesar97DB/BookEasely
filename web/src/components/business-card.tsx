import { BusinessImageCarousel } from '@/components/business-image-carousel'
import type { BusinessWithCategory } from '@/lib/types'
import { Clock, MapPin, Phone, Star } from 'lucide-react'
import Link from 'next/link'

interface BusinessCardProps {
	business: BusinessWithCategory
}

export function BusinessCard({ business }: BusinessCardProps) {
	const images = business.photos?.length
		? business.photos
		: business.cover_image_url
			? [business.cover_image_url]
			: []

	const location = [business.city, business.state].filter(Boolean).join(', ')

	return (
		<Link
			href={`/business/${business.slug}`}
			className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
		>
			<BusinessImageCarousel
				images={images}
				alt={business.name}
				aspectRatio="square"
				sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
			/>

			<div className="flex flex-1 flex-col p-3 gap-2">
				<h3 className="truncate text-sm font-semibold group-hover:text-primary transition-colors">
					{business.name}
				</h3>

				<div className="flex items-center gap-1.5 flex-wrap">
					{business.rating_count > 0 ? (
						<div className="flex items-center gap-0.5">
							<Star className="h-3 w-3 fill-amber-400 text-amber-400" />
							<span className="text-xs font-medium">
								{Number(business.rating_avg).toFixed(1)}
							</span>
							<span className="text-xs text-muted-foreground">
								({business.rating_count})
							</span>
						</div>
					) : (
						<span className="text-xs text-muted-foreground">New</span>
					)}
					{business.categories?.name && (
						<>
							<span className="text-muted-foreground/40">&middot;</span>
							<span className="truncate text-xs text-muted-foreground">
								{business.categories.name}
							</span>
						</>
					)}
				</div>

				{location && (
					<p className="flex items-center gap-1 text-xs text-muted-foreground">
						<MapPin className="h-3 w-3 shrink-0" />
						<span className="truncate">{location}</span>
					</p>
				)}
				{business.phone && (
					<p className="flex items-center gap-1 text-xs text-muted-foreground">
						<Phone className="h-3 w-3 shrink-0" />
						<span className="truncate">{business.phone}</span>
					</p>
				)}

				<div className="mt-auto flex items-center gap-1.5 pt-1">
					{business.auto_confirm && (
						<span className="inline-flex items-center gap-0.5 rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
							<Clock className="h-2.5 w-2.5" />
							Instant
						</span>
					)}
				</div>
			</div>
		</Link>
	)
}
