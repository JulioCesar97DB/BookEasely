'use client'

import { signOut } from '@/app/(auth)/actions'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { UserRole } from '@/lib/types'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
	Calendar,
	CalendarCheck,
	ChevronsLeft,
	ChevronsRight,
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
import { useState } from 'react'

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

const SIDEBAR_EXPANDED = 256
const SIDEBAR_COLLAPSED = 68

export function DashboardSidebar({ role, userName, isWorker }: { role: UserRole; userName: string; isWorker?: boolean }) {
	const pathname = usePathname()
	const nav = role === 'business_owner' ? businessNav : isWorker ? workerNav : clientNav

	const [collapsed, setCollapsed] = useState(() => {
		if (typeof window === 'undefined') return false
		return localStorage.getItem('sidebar-collapsed') === 'true'
	})

	function toggleCollapsed() {
		setCollapsed((prev) => {
			const next = !prev
			localStorage.setItem('sidebar-collapsed', String(next))
			return next
		})
	}

	return (
		<TooltipProvider>
			<motion.aside
				className="relative flex h-svh flex-col border-r bg-sidebar overflow-visible"
				animate={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
				transition={{ duration: 0.2, ease: 'easeInOut' }}
				style={{ flexShrink: 0 }}
			>
				{/* Collapse toggle — sits on the right border */}
				<button
					type="button"
					onClick={toggleCollapsed}
					className={cn(
						'absolute top-5 z-20 flex h-6 w-6 items-center justify-center rounded-full border bg-sidebar text-sidebar-foreground/50 shadow-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground',
						collapsed ? '-right-3' : '-right-3'
					)}
				>
					{collapsed ? <ChevronsRight className="h-3.5 w-3.5" /> : <ChevronsLeft className="h-3.5 w-3.5" />}
				</button>

				{/* Logo */}
				<div className="overflow-hidden">
					<div className={cn('flex h-16 items-center gap-2.5', collapsed ? 'justify-center px-3' : 'px-6')}>
						<Link href="/" className="flex items-center gap-2.5">
							<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
								<CalendarCheck className="h-4.5 w-4.5 text-primary-foreground" />
							</div>
							<AnimatePresence>
								{!collapsed && (
									<motion.span
										initial={{ opacity: 0, width: 0 }}
										animate={{ opacity: 1, width: 'auto' }}
										exit={{ opacity: 0, width: 0 }}
										transition={{ duration: 0.15 }}
										className="overflow-hidden whitespace-nowrap text-lg font-semibold tracking-tight"
									>
										BookEasely
									</motion.span>
								)}
							</AnimatePresence>
						</Link>
					</div>
				</div>

				<Separator />

				{/* Navigation */}
				<nav className={cn('flex-1 space-y-1 py-4 overflow-hidden', collapsed ? 'px-2' : 'px-3')}>
					{nav.map((item) => {
						const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
						return (
							<NavLink
								key={item.href}
								item={item}
								isActive={isActive}
								collapsed={collapsed}
							/>
						)
					})}
				</nav>

				{/* Footer */}
				<div className={cn('border-t space-y-1 overflow-hidden', collapsed ? 'p-2' : 'p-4')}>
					{/* Settings */}
					<NavLink
						item={{ label: 'Settings', href: '/dashboard/settings', icon: Settings }}
						isActive={pathname === '/dashboard/settings'}
						collapsed={collapsed}
					/>

					{/* User row */}
					<div className={cn(
						'flex items-center',
						collapsed ? 'flex-col gap-1 py-2' : 'justify-between px-3 py-2'
					)}>
						<Link
							href="/dashboard/profile"
							className={cn(
								'flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity',
								collapsed && 'justify-center'
							)}
						>
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
										{userName.charAt(0).toUpperCase()}
									</div>
								</TooltipTrigger>
								{collapsed && (
									<TooltipContent side="right" sideOffset={8}>
										{userName}
									</TooltipContent>
								)}
							</Tooltip>
							<AnimatePresence>
								{!collapsed && (
									<motion.span
										initial={{ opacity: 0, width: 0 }}
										animate={{ opacity: 1, width: 'auto' }}
										exit={{ opacity: 0, width: 0 }}
										transition={{ duration: 0.15 }}
										className="truncate text-sm font-medium overflow-hidden whitespace-nowrap"
									>
										{userName}
									</motion.span>
								)}
							</AnimatePresence>
						</Link>
						<div className={cn('flex items-center', collapsed ? 'flex-col gap-1' : 'gap-1')}>
							<ThemeToggle className="h-8 w-8 shrink-0 text-muted-foreground" />
							<form action={signOut}>
								<Button type="submit" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive">
									<LogOut className="h-4 w-4" />
								</Button>
							</form>
						</div>
					</div>

				</div>
			</motion.aside>
		</TooltipProvider>
	)
}

function NavLink({
	item,
	isActive,
	collapsed,
}: {
	item: NavItem
	isActive: boolean
	collapsed: boolean
}) {
	const content = (
		<Link
			href={item.href}
			className={cn(
				'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
				collapsed && 'justify-center px-0',
				isActive
					? 'text-primary'
					: 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
			)}
		>
			{isActive && (
				<motion.div
					layoutId="sidebar-active"
					className="absolute inset-0 rounded-lg bg-primary/10"
					transition={{ type: 'spring', stiffness: 350, damping: 30 }}
				/>
			)}
			<item.icon className="relative h-4 w-4 shrink-0" />
			<AnimatePresence>
				{!collapsed && (
					<motion.span
						initial={{ opacity: 0, width: 0 }}
						animate={{ opacity: 1, width: 'auto' }}
						exit={{ opacity: 0, width: 0 }}
						transition={{ duration: 0.15 }}
						className="relative overflow-hidden whitespace-nowrap"
					>
						{item.label}
					</motion.span>
				)}
			</AnimatePresence>
		</Link>
	)

	if (collapsed) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					{content}
				</TooltipTrigger>
				<TooltipContent side="right" sideOffset={8}>
					{item.label}
				</TooltipContent>
			</Tooltip>
		)
	}

	return content
}
