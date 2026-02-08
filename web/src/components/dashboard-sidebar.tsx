'use client'

import { signOut } from '@/app/(auth)/actions'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { UserRole } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
	Calendar,
	CalendarCheck,
	ClipboardList,
	Clock,
	Heart,
	LayoutDashboard,
	LogOut,
	Search,
	Settings,
	Star,
	Store,
	Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
	label: string
	href: string
	icon: React.ComponentType<{ className?: string }>
}

const clientNav: NavItem[] = [
	{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
	{ label: 'My Bookings', href: '/dashboard/bookings', icon: Calendar },
	{ label: 'Favorites', href: '/dashboard/favorites', icon: Heart },
	{ label: 'Discover', href: '/dashboard/discover', icon: Search },
]

const workerNav: NavItem[] = [
	{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
	{ label: 'My Schedule', href: '/dashboard/my-schedule', icon: Clock },
	{ label: 'My Bookings', href: '/dashboard/bookings', icon: Calendar },
	{ label: 'Discover', href: '/dashboard/discover', icon: Search },
]

const businessNav: NavItem[] = [
	{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
	{ label: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
	{ label: 'Schedule', href: '/dashboard/schedule', icon: Clock },
	{ label: 'Services', href: '/dashboard/services', icon: ClipboardList },
	{ label: 'Workers', href: '/dashboard/workers', icon: Users },
	{ label: 'Reviews', href: '/dashboard/reviews', icon: Star },
	{ label: 'Business', href: '/dashboard/business', icon: Store },
]

export function DashboardSidebar({ role, userName, isWorker }: { role: UserRole; userName: string; isWorker?: boolean }) {
	const pathname = usePathname()
	const nav = role === 'business_owner' ? businessNav : isWorker ? workerNav : clientNav

	return (
		<aside className="flex h-svh w-64 flex-col border-r bg-sidebar">
			{/* Logo */}
			<div className="flex h-16 items-center gap-2.5 px-6">
				<Link href="/" className="flex items-center gap-2.5">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
						<CalendarCheck className="h-4.5 w-4.5 text-primary-foreground" />
					</div>
					<span className="text-lg font-semibold tracking-tight">BookEasely</span>
				</Link>
			</div>

			<Separator />

			{/* Navigation */}
			<nav className="flex-1 space-y-1 px-3 py-4">
				{nav.map((item) => {
					const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
								isActive
									? 'bg-primary/10 text-primary'
									: 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
							)}
						>
							<item.icon className="h-4 w-4" />
							{item.label}
						</Link>
					)
				})}
			</nav>

			{/* Footer */}
			<div className="border-t p-4 space-y-2">
				<Link
					href="/dashboard/settings"
					className={cn(
						'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
						pathname === '/dashboard/settings'
							? 'bg-primary/10 text-primary'
							: 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
					)}
				>
					<Settings className="h-4 w-4" />
					Settings
				</Link>

				<div className="flex items-center justify-between px-3 py-2">
					<Link href="/dashboard/profile" className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
							{userName.charAt(0).toUpperCase()}
						</div>
						<span className="truncate text-sm font-medium">{userName}</span>
					</Link>
					<div className="flex items-center gap-1">
						<ThemeToggle className="h-8 w-8 shrink-0 text-muted-foreground" />
						<form action={signOut}>
							<Button type="submit" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive">
								<LogOut className="h-4 w-4" />
							</Button>
						</form>
					</div>
				</div>
			</div>
		</aside>
	)
}
