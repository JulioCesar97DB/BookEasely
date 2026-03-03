'use client'

import { AnimatedCard } from '@/components/animated-cards'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DAYS_FULL, DAYS_SHORT } from '@/lib/constants'
import { formatTime } from '@/lib/format'
import type { BusinessHours, BusinessWithCategory } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Clock, Globe, Mail, MapPin, Phone } from 'lucide-react'

interface HoursTabProps {
	hours: BusinessHours[]
	business: BusinessWithCategory
}

export function HoursTab({ hours, business }: HoursTabProps) {
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
							{DAYS_FULL.map((day, i) => {
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
												{DAYS_SHORT[i]}
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
