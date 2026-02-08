import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

export default function BookingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
				<p className="mt-1 text-muted-foreground">
					Manage your upcoming and past appointments
				</p>
			</div>

			<Card>
				<CardContent className="flex flex-col items-center justify-center py-16 text-center">
					<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
						<Calendar className="h-7 w-7 text-primary" />
					</div>
					<h3 className="mt-4 font-semibold">No bookings yet</h3>
					<p className="mt-1 max-w-sm text-sm text-muted-foreground">
						When you book an appointment, it will appear here. You can track upcoming visits and review past ones.
					</p>
				</CardContent>
			</Card>
		</div>
	)
}
