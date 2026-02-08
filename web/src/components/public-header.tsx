import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { CalendarCheck } from 'lucide-react'
import Link from 'next/link'

export async function PublicHeader() {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<Link href="/" className="flex items-center gap-2.5">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
						<CalendarCheck className="h-4.5 w-4.5 text-primary-foreground" />
					</div>
					<span className="text-lg font-semibold tracking-tight">BookEasely</span>
				</Link>

				<div className="flex items-center gap-2">
					<ThemeToggle className="h-9 w-9 text-muted-foreground" />
					{user ? (
						<Button asChild size="sm">
							<Link href="/dashboard">Dashboard</Link>
						</Button>
					) : (
						<>
							<Button asChild variant="ghost" size="sm">
								<Link href="/auth/login">Sign in</Link>
							</Button>
							<Button asChild size="sm">
								<Link href="/auth/signup">Get started</Link>
							</Button>
						</>
					)}
				</div>
			</div>
		</header>
	)
}
