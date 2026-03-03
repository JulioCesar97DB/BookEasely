'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { DAYS_FULL } from '@/lib/constants'
import type { WorkerAvailability } from '@/lib/types'
import { Clock, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { upsertWorkerAvailability } from '../actions'

interface AvailabilitySectionProps {
	workerId: string
	availability: WorkerAvailability[]
}

export function AvailabilitySection({
	workerId,
	availability,
}: AvailabilitySectionProps) {
	const [saving, setSaving] = useState(false)
	const [schedule, setSchedule] = useState(() =>
		DAYS_FULL.map((_, i) => {
			const existing = availability.find((a) => a.day_of_week === i)
			return {
				day_of_week: i,
				start_time: existing?.start_time ?? '09:00',
				end_time: existing?.end_time ?? '17:00',
				is_active: existing?.is_active ?? (i >= 1 && i <= 5),
			}
		})
	)

	function updateDay(index: number, field: string, value: string | boolean) {
		setSchedule((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
	}

	async function handleSave() {
		// Validate time ranges
		for (const day of schedule) {
			if (!day.is_active) continue
			if (day.start_time >= day.end_time) {
				toast.error(`End time must be after start time for ${DAYS_FULL[day.day_of_week]?.slice(0, 3)}`)
				return
			}
		}

		setSaving(true)
		const result = await upsertWorkerAvailability(workerId, schedule)
		setSaving(false)
		if (result.error) {
			toast.error(result.error)
		} else {
			toast.success('Availability updated')
		}
	}

	return (
		<div>
			<h4 className="flex items-center gap-2 text-sm font-semibold mb-3">
				<Clock className="h-4 w-4" />
				Weekly Availability
			</h4>
			<div className="space-y-2">
				{schedule.map((day, index) => (
					<div
						key={day.day_of_week}
						className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
					>
						<div className="w-16 font-medium text-xs">{DAYS_FULL[index]?.slice(0, 3)}</div>
						<Switch
							checked={day.is_active}
							onCheckedChange={(checked) => updateDay(index, 'is_active', checked)}
						/>
						{day.is_active && (
							<div className="flex items-center gap-1">
								<Input
									type="time"
									value={day.start_time}
									onChange={(e) => updateDay(index, 'start_time', e.target.value)}
									className="h-8 w-28 text-xs"
								/>
								<span className="text-xs text-muted-foreground">-</span>
								<Input
									type="time"
									value={day.end_time}
									onChange={(e) => updateDay(index, 'end_time', e.target.value)}
									className="h-8 w-28 text-xs"
								/>
							</div>
						)}
					</div>
				))}
			</div>
			<Button onClick={handleSave} disabled={saving} size="sm" className="mt-3">
				{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
				Save Availability
			</Button>
		</div>
	)
}
