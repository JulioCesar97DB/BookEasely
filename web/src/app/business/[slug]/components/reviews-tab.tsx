import { AnimatedCard } from '@/components/animated-cards'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getInitials } from '@/lib/format'
import type { BusinessWithCategory, Review } from '@/lib/types'
import { cn } from '@/lib/utils'
import { MessageSquare, Star, User } from 'lucide-react'
import { EmptyState } from './empty-state'

export interface ReviewWithProfile extends Review {
	profiles: { full_name: string; avatar_url: string | null } | null
}

interface ReviewsTabProps {
	reviews: ReviewWithProfile[]
	business: BusinessWithCategory
}

export function ReviewsTab({ reviews, business }: ReviewsTabProps) {
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
