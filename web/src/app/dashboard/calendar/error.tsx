'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	return (
		<div className="flex flex-col items-center justify-center py-20 text-center">
			<AlertCircle className="h-10 w-10 text-destructive" />
			<h2 className="mt-4 text-xl font-semibold">Something went wrong</h2>
			<p className="mt-2 text-muted-foreground">
				Could not load the calendar. Please try again.
			</p>
			<Button onClick={reset} className="mt-4">
				Try again
			</Button>
		</div>
	)
}
