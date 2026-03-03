'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { markAllNotificationsRead, markNotificationRead } from '@/lib/booking/actions'
import type { Notification } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Bell, Calendar, CheckCheck, Mail, MessageSquare, Star, UserPlus, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
	booking_confirmed: Calendar,
	new_booking: Calendar,
	booking_reminder: Bell,
	booking_cancelled: XCircle,
	new_review: Star,
	worker_added: UserPlus,
	worker_invitation: Mail,
}

function formatRelativeTime(dateStr: string) {
	const now = new Date()
	const date = new Date(dateStr)
	const diffMs = now.getTime() - date.getTime()
	const diffMins = Math.floor(diffMs / 60000)
	if (diffMins < 1) return 'Just now'
	if (diffMins < 60) return `${diffMins}m ago`
	const diffHours = Math.floor(diffMins / 60)
	if (diffHours < 24) return `${diffHours}h ago`
	const diffDays = Math.floor(diffHours / 24)
	if (diffDays < 7) return `${diffDays}d ago`
	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function NotificationsList({ notifications }: { notifications: Notification[] }) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	const unreadCount = notifications.filter((n) => !n.is_read).length

	function handleMarkAllRead() {
		startTransition(async () => {
			await markAllNotificationsRead()
			router.refresh()
		})
	}

	function getNotificationHref(type: string): string | null {
		switch (type) {
			case 'new_booking':
			case 'booking_confirmed':
			case 'booking_cancelled':
			case 'booking_reminder':
				return '/dashboard/bookings'
			case 'new_review':
				return '/dashboard/reviews'
			case 'worker_added':
			case 'worker_invitation':
				return '/dashboard'
			default:
				return null
		}
	}

	function handleClick(notification: Notification) {
		startTransition(async () => {
			if (!notification.is_read) {
				await markNotificationRead(notification.id)
			}
			const href = getNotificationHref(notification.type)
			if (href) {
				router.push(href)
			} else {
				router.refresh()
			}
		})
	}

	return (
		<div className="space-y-4">
			{unreadCount > 0 && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">{unreadCount} unread</p>
					<Button variant="ghost" size="sm" onClick={handleMarkAllRead} disabled={isPending}>
						<CheckCheck className="h-4 w-4 mr-1" />
						Mark all read
					</Button>
				</div>
			)}

			<div className="space-y-2">
				{notifications.map((notification) => {
					const Icon = ICON_MAP[notification.type] ?? Bell
					return (
						<Card
							key={notification.id}
							className={cn(
								'py-0 transition-colors cursor-pointer',
								!notification.is_read && 'border-primary/20 bg-primary/5'
							)}
							onClick={() => handleClick(notification)}
						>
							<CardContent className="flex items-start gap-3 p-4">
								<div className={cn(
									'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
									!notification.is_read ? 'bg-primary/10' : 'bg-muted'
								)}>
									<Icon className={cn(
										'h-4 w-4',
										!notification.is_read ? 'text-primary' : 'text-muted-foreground'
									)} />
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-start justify-between gap-2">
										<p className={cn(
											'text-sm',
											!notification.is_read ? 'font-medium' : 'text-muted-foreground'
										)}>
											{notification.title}
										</p>
										<span className="text-[11px] text-muted-foreground shrink-0">
											{formatRelativeTime(notification.created_at)}
										</span>
									</div>
									<p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
										{notification.body}
									</p>
								</div>
								{!notification.is_read && (
									<div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
								)}
							</CardContent>
						</Card>
					)
				})}
			</div>
		</div>
	)
}
