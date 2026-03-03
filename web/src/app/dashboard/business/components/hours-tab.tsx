'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { DAYS_FULL } from '@/lib/constants'
import type { BusinessHours } from '@/lib/types'
import { Clock, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { updateBusinessHours } from '../actions'

interface HoursTabProps {
	businessId: string
	initialHours: BusinessHours[]
}

export function HoursTab({ businessId, initialHours }: HoursTabProps) {
	const [saving, setSaving] = useState(false)
	const [hours, setHours] = useState<Array<{
		day_of_week: number
		open_time: string
		close_time: string
		is_closed: boolean
	}>>(() =>
		DAYS_FULL.map((_, i) => {
			const existing = initialHours.find((h) => h.day_of_week === i)
			return {
				day_of_week: i,
				open_time: existing?.open_time ?? '09:00',
				close_time: existing?.close_time ?? '17:00',
				is_closed: existing?.is_closed ?? (i === 0),
			}
		})
	)

	function updateHour(index: number, field: string, value: string | boolean) {
		setHours((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)))
	}

	function applyToWeekdays() {
		const monday = hours[1]
		if (!monday) return
		setHours((prev) =>
			prev.map((h, i) =>
				i >= 1 && i <= 5
					? { ...h, open_time: monday.open_time, close_time: monday.close_time, is_closed: monday.is_closed }
					: h
			)
		)
		toast.info('Monday hours applied to all weekdays')
	}

	async function handleSave() {
		setSaving(true)
		const result = await updateBusinessHours(businessId, hours)
		setSaving(false)
		if (result.error) {
			toast.error(result.error)
		} else {
			toast.success('Business hours updated')
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Clock className="h-5 w-5" />
							Business Hours
						</CardTitle>
						<CardDescription>Set your operating hours for each day of the week.</CardDescription>
					</div>
					<Button variant="outline" size="sm" onClick={applyToWeekdays}>
						Apply Mon to weekdays
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{hours.map((hour, index) => (
						<div
							key={hour.day_of_week}
							className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
						>
							<div className="w-28 font-medium text-sm">{DAYS_FULL[index]}</div>
							<div className="flex items-center gap-2">
								<Switch
									checked={!hour.is_closed}
									onCheckedChange={(checked) => updateHour(index, 'is_closed', !checked)}
								/>
								<span className="text-xs text-muted-foreground w-10">
									{hour.is_closed ? 'Closed' : 'Open'}
								</span>
							</div>
							{!hour.is_closed && (
								<div className="flex items-center gap-2">
									<Input
										type="time"
										value={hour.open_time}
										onChange={(e) => updateHour(index, 'open_time', e.target.value)}
										className="w-32"
									/>
									<span className="text-muted-foreground text-sm">to</span>
									<Input
										type="time"
										value={hour.close_time}
										onChange={(e) => updateHour(index, 'close_time', e.target.value)}
										className="w-32"
									/>
								</div>
							)}
						</div>
					))}
				</div>

				<div className="flex justify-end pt-6">
					<Button onClick={handleSave} disabled={saving}>
						{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save hours
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
