'use client'

import { signOut } from '@/app/(auth)/actions'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import type { UserRole } from '@/lib/types'
import { cn } from '@/lib/utils'
import { CalendarCheck, LogOut, Menu, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { getNavForRole } from './dashboard-sidebar'

export function MobileHeader({ role, userName, isWorker }: { role: UserRole; userName: string; isWorker?: boolean }) {
	const [open, setOpen] = useState(false)
	const pathname = usePathname()
	const nav = getNavForRole(role, isWorker)

	return (
		<header className="sticky top-0 z-40 flex h-14 items-center border-b bg-sidebar px-4 md:hidden">
			{/* Hamburger */}
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
			>
				<Menu className="h-5 w-5" />
			</button>

			{/* Logo centered */}
			<Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
				<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
					<CalendarCheck className="h-4 w-4 text-primary-foreground" />
				</div>
				<span className="text-base font-semibold tracking-tight">BookEasely</span>
			</Link>

			{/* Drawer */}
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetContent side="left" showCloseButton={false} className="w-72 p-0">
					<SheetTitle className="sr-only">Navigation</SheetTitle>
					{/* Drawer logo */}
					<div className="flex h-14 items-center gap-2.5 px-5 border-b">
						<Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
							<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
								<CalendarCheck className="h-4.5 w-4.5 text-primary-foreground" />
							</div>
							<span className="text-lg font-semibold tracking-tight">BookEasely</span>
						</Link>
					</div>

					{/* Navigation */}
					<nav className="flex-1 space-y-1 px-3 py-4">
						{nav.map((item) => {
							const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
							return (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setOpen(false)}
									className={cn(
										'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
										isActive
											? 'bg-primary/10 text-primary'
											: 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
									)}
								>
									<item.icon className="h-4 w-4 shrink-0" />
									{item.label}
								</Link>
							)
						})}
					</nav>

					<Separator />

					{/* Footer */}
					<div className="space-y-1 p-3">
						<Link
							href="/dashboard/settings"
							onClick={() => setOpen(false)}
							className={cn(
								'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
								pathname === '/dashboard/settings'
									? 'bg-primary/10 text-primary'
									: 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
							)}
						>
							<Settings className="h-4 w-4 shrink-0" />
							Settings
						</Link>

						<div className="flex items-center justify-between px-3 py-2">
							<Link
								href="/dashboard/profile"
								onClick={() => setOpen(false)}
								className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
							>
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
				</SheetContent>
			</Sheet>
		</header>
	)
}
