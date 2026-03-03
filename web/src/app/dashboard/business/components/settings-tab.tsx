'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { Business } from '@/lib/types'
import { Loader2, Settings } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { updateBusinessSettings } from '../actions'

interface SettingsTabProps {
	business: Business
}

export function SettingsTab({ business }: SettingsTabProps) {
	const [saving, setSaving] = useState(false)
	const [cancellationPolicy, setCancellationPolicy] = useState(business.cancellation_policy ?? '')
	const [cancellationHours, setCancellationHours] = useState(business.cancellation_hours)
	const [autoConfirm, setAutoConfirm] = useState(business.auto_confirm)
	const [bufferMinutes, setBufferMinutes] = useState(business.buffer_minutes)

	async function handleSave() {
		setSaving(true)
		const result = await updateBusinessSettings(business.id, {
			cancellation_policy: cancellationPolicy,
			cancellation_hours: cancellationHours,
			auto_confirm: autoConfirm,
			buffer_minutes: bufferMinutes,
		})
		setSaving(false)
		if (result.error) {
			toast.error(result.error)
		} else {
			toast.success('Settings updated')
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Settings className="h-5 w-5" />
					Booking Settings
				</CardTitle>
				<CardDescription>Configure how bookings work for your business.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-2">
					<label className="text-sm font-medium">Cancellation Policy</label>
					<Textarea
						value={cancellationPolicy}
						onChange={(e) => setCancellationPolicy(e.target.value)}
						placeholder="Describe your cancellation policy..."
						className="min-h-24 resize-none"
					/>
				</div>

				<div className="grid gap-6 sm:grid-cols-2">
					<div className="space-y-2">
						<label className="text-sm font-medium">Cancellation Window</label>
						<div className="flex items-center gap-2">
							<Input
								type="number"
								min={1}
								max={168}
								value={cancellationHours}
								onChange={(e) => setCancellationHours(parseInt(e.target.value) || 24)}
								className="w-24"
							/>
							<span className="text-sm text-muted-foreground">hours before appointment</span>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Buffer Time</label>
						<div className="flex items-center gap-2">
							<Input
								type="number"
								min={0}
								max={120}
								value={bufferMinutes}
								onChange={(e) => setBufferMinutes(parseInt(e.target.value) || 0)}
								className="w-24"
							/>
							<span className="text-sm text-muted-foreground">minutes between appointments</span>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-between rounded-lg border p-4">
					<div>
						<p className="text-sm font-medium">Auto-confirm bookings</p>
						<p className="text-sm text-muted-foreground">
							Automatically confirm new bookings without manual approval.
						</p>
					</div>
					<Switch checked={autoConfirm} onCheckedChange={setAutoConfirm} />
				</div>

				<div className="flex justify-end pt-4">
					<Button onClick={handleSave} disabled={saving}>
						{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save settings
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
