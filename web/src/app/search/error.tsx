'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return (
		<div className="flex min-h-[50vh] items-center justify-center p-4">
			<Card className="max-w-md">
				<CardContent className="flex flex-col items-center py-8 text-center">
					<AlertTriangle className="h-10 w-10 text-destructive" />
					<h2 className="mt-4 text-lg font-semibold">Something went wrong</h2>
					<p className="mt-2 text-sm text-muted-foreground">{error.message || 'An unexpected error occurred'}</p>
					<Button onClick={reset} className="mt-4">Try Again</Button>
				</CardContent>
			</Card>
		</div>
	)
}
