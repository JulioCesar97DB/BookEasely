'use client'

import type { CarouselApi } from '@/components/ui/carousel'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

interface Props {
	images: string[]
	alt: string
	aspectRatio?: 'video' | 'square'
	sizes?: string
	className?: string
}

export function BusinessImageCarousel({
	images,
	alt,
	aspectRatio = 'video',
	sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
	className,
}: Props) {
	const [api, setApi] = useState<CarouselApi>()
	const [current, setCurrent] = useState(0)
	const currentRef = useRef(current)
	currentRef.current = current

	useEffect(() => {
		if (!api) return

		const onSelect = () => {
			const snap = api.selectedScrollSnap()
			if (snap !== currentRef.current) {
				setCurrent(snap)
			}
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
					aspectRatio === 'video' ? 'aspect-video' : 'aspect-square',
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
					aspectRatio === 'video' ? 'aspect-video' : 'aspect-square',
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
									aspectRatio === 'video' ? 'aspect-video' : 'aspect-square',
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
