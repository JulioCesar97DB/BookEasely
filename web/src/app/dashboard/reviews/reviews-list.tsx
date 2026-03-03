'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { respondToReview } from '@/lib/booking/actions'
import { getInitials } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Loader2, MessageSquare, Star, User } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface ReviewWithProfile {
	id: string
	rating: number
	comment: string | null
	business_response: string | null
	created_at: string
	profiles: { full_name: string; avatar_url: string | null } | null
}


export function ReviewsList({
	reviews,
	ratingAvg,
	ratingCount,
}: {
	reviews: ReviewWithProfile[]
	ratingAvg: number
	ratingCount: number
}) {
	return (
		<div className="space-y-4">
			{/* Rating Summary */}
			<Card className="py-0">
				<CardContent className="p-5">
					<div className="flex items-center gap-6">
						<div className="text-center">
							<p className="text-4xl font-bold tracking-tight">{Number(ratingAvg).toFixed(1)}</p>
							<div className="mt-1 flex items-center gap-0.5">
								{Array.from({ length: 5 }).map((_, i) => (
									<Star
										key={i}
										className={cn(
											'h-3.5 w-3.5',
											i < Math.round(Number(ratingAvg))
												? 'fill-amber-400 text-amber-400'
												: 'text-muted-foreground/30'
										)}
									/>
								))}
							</div>
							<p className="mt-1 text-xs text-muted-foreground">
								{ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Reviews */}
			{reviews.map((review) => (
				<ReviewCard key={review.id} review={review} />
			))}
		</div>
	)
}

function ReviewCard({ review }: { review: ReviewWithProfile }) {
	const [showReplyForm, setShowReplyForm] = useState(false)
	const [reply, setReply] = useState(review.business_response ?? '')
	const [isPending, startTransition] = useTransition()

	function handleSubmitReply() {
		if (!reply.trim()) return
		startTransition(async () => {
			const result = await respondToReview({ reviewId: review.id, response: reply.trim() })
			if (result.error) {
				toast.error(result.error)
			} else {
				toast.success('Response saved')
				setShowReplyForm(false)
			}
		})
	}

	return (
		<Card className="py-0">
			<CardContent className="p-4">
				<div className="flex items-start gap-3">
					<Avatar className="h-9 w-9 shrink-0">
						<AvatarImage src={review.profiles?.avatar_url ?? undefined} />
						<AvatarFallback className="text-xs">
							{review.profiles ? getInitials(review.profiles.full_name) : <User className="h-4 w-4" />}
						</AvatarFallback>
					</Avatar>
					<div className="flex-1 min-w-0">
						<div className="flex items-center justify-between gap-2">
							<p className="text-sm font-medium">
								{review.profiles?.full_name ?? 'Anonymous'}
							</p>
							<time className="text-[11px] text-muted-foreground shrink-0">
								{new Date(review.created_at).toLocaleDateString('en-US', {
									month: 'short', day: 'numeric', year: 'numeric',
								})}
							</time>
						</div>
						<div className="mt-0.5 flex items-center gap-0.5">
							{Array.from({ length: 5 }).map((_, j) => (
								<Star
									key={j}
									className={cn(
										'h-3 w-3',
										j < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
									)}
								/>
							))}
						</div>
						{review.comment && (
							<p className="mt-2 text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
						)}

						{review.business_response && !showReplyForm && (
							<div className="mt-3 rounded-lg bg-muted/50 p-3 border-l-2 border-primary/30">
								<p className="text-[11px] font-medium text-muted-foreground mb-1">Your response</p>
								<p className="text-xs text-muted-foreground leading-relaxed">{review.business_response}</p>
							</div>
						)}

						{showReplyForm ? (
							<div className="mt-3 space-y-2">
								<Textarea
									value={reply}
									onChange={(e) => setReply(e.target.value)}
									placeholder="Write your response..."
									rows={2}
									className="text-sm"
								/>
								<div className="flex gap-2">
									<Button size="sm" onClick={handleSubmitReply} disabled={isPending}>
										{isPending && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
										Save
									</Button>
									<Button size="sm" variant="ghost" onClick={() => setShowReplyForm(false)}>
										Cancel
									</Button>
								</div>
							</div>
						) : (
							<Button
								size="sm"
								variant="ghost"
								className="mt-2 text-xs"
								onClick={() => setShowReplyForm(true)}
							>
								<MessageSquare className="h-3 w-3 mr-1" />
								{review.business_response ? 'Edit Response' : 'Respond'}
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
