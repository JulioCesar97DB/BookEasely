import { Card, CardContent } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
				<p className="mt-1 text-muted-foreground">
					Manage your account preferences and notifications
				</p>
			</div>

			<Card>
				<CardContent className="flex flex-col items-center justify-center py-16 text-center">
					<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
						<Settings className="h-7 w-7 text-primary" />
					</div>
					<h3 className="mt-4 font-semibold">Settings coming soon</h3>
					<p className="mt-1 max-w-sm text-sm text-muted-foreground">
						Account preferences, notification settings, and profile management will be available here.
					</p>
				</CardContent>
			</Card>
		</div>
	)
}
