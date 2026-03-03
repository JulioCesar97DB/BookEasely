'use client'

import type { CarouselApi } from '@/components/ui/carousel'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface Props {
	images: string[]
	alt: string
	aspectRatio?: 'video' | 'square' | 'compact'
	sizes?: string
	className?: string
	showArrows?: boolean
}

const aspectClasses = {
	video: 'aspect-video',
	square: 'aspect-square',
	compact: 'aspect-[2/1]',
} as const

export function BusinessImageCarousel({
	images,
	alt,
	aspectRatio = 'video',
	sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
	className,
	showArrows = false,
}: Props) {
	const [api, setApi] = useState<CarouselApi>()
	const [current, setCurrent] = useState(0)

	useEffect(() => {
		if (!api) return

		const onSelect = () => {
			setCurrent(api.selectedScrollSnap())
		}

		api.on('select', onSelect)
		return () => {
			api.off('select', onSelect)
		}
	}, [api])

	// No images — placeholder
	if (images.length === 0) {
		return (
			<div
				className={cn(
					'relative bg-linear-to-br from-muted to-muted/50',
					aspectClasses[aspectRatio],
					className,
				)}
			>
				<div className="flex h-full items-center justify-center text-muted-foreground/30">
					<Search className="h-8 w-8" />
				</div>
			</div>
		)
	}

	// Single image — no carousel chrome
	if (images.length === 1) {
		return (
			<div
				className={cn(
					'relative bg-muted',
					aspectClasses[aspectRatio],
					className,
				)}
			>
				<Image
					src={images[0]}
					alt={alt}
					fill
					sizes={sizes}
					className="object-cover"
				/>
			</div>
		)
	}

	// Multiple images — carousel with dots
	return (
		<div className={cn('relative', className)}>
			<Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
				<CarouselContent className="-ml-0">
					{images.map((url, i) => (
						<CarouselItem key={url} className="pl-0">
							<div
								className={cn(
									'relative bg-muted',
									aspectClasses[aspectRatio],
								)}
							>
								<Image
									src={url}
									alt={`${alt} ${i + 1}`}
									fill
									sizes={sizes}
									className="object-cover"
								/>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				{showArrows && (
					<>
						<CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 bg-black/40 border-0 text-white hover:bg-black/60" />
						<CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 bg-black/40 border-0 text-white hover:bg-black/60" />
					</>
				)}
			</Carousel>

			{/* Dot indicators */}
			<div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
				{images.map((_, i) => (
					<button
						key={i}
						type="button"
						onClick={() => api?.scrollTo(i)}
						className={cn(
							'h-1.5 rounded-full transition-all',
							i === current
								? 'w-4 bg-white'
								: 'w-1.5 bg-white/50',
						)}
					/>
				))}
			</div>
		</div>
	)
}
