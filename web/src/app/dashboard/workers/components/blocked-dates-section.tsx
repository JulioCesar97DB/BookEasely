'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { WorkerBlockedDate } from '@/lib/types'
import { CalendarOff, Loader2, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { addBlockedDate, removeBlockedDate } from '../actions'

interface BlockedDatesSectionProps {
	workerId: string
	blockedDates: WorkerBlockedDate[]
}

export function BlockedDatesSection({
	workerId,
	blockedDates,
}: BlockedDatesSectionProps) {
	const [adding, setAdding] = useState(false)
	const [saving, setSaving] = useState(false)
	const [newDate, setNewDate] = useState('')
	const [newReason, setNewReason] = useState('')

	async function handleAdd() {
		if (!newDate) {
			toast.error('Please select a date')
			return
		}
		setSaving(true)
		const result = await addBlockedDate(workerId, { date: newDate, reason: newReason })
		setSaving(false)
		if (result.error) {
			toast.error(result.error)
		} else {
			toast.success('Blocked date added')
			setAdding(false)
			setNewDate('')
			setNewReason('')
		}
	}

	async function handleRemove(id: string) {
		const result = await removeBlockedDate(id)
		if (result.error) {
			toast.error(result.error)
		} else {
			toast.success('Blocked date removed')
		}
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-3">
				<h4 className="flex items-center gap-2 text-sm font-semibold">
					<CalendarOff className="h-4 w-4" />
					Blocked Dates
				</h4>
				<Button variant="ghost" size="sm" onClick={() => setAdding(!adding)} className="gap-1 h-7 text-xs">
					<Plus className="h-3 w-3" />
					Add
				</Button>
			</div>

			{adding && (
				<div className="rounded-md border p-3 mb-3 space-y-2">
					<div className="flex gap-2">
						<Input
							type="date"
							value={newDate}
							onChange={(e) => setNewDate(e.target.value)}
							className="h-8 text-xs"
						/>
						<Input
							value={newReason}
							onChange={(e) => setNewReason(e.target.value)}
							placeholder="Reason (optional)"
							className="h-8 text-xs"
						/>
					</div>
					<div className="flex gap-2">
						<Button size="sm" onClick={handleAdd} disabled={saving} className="h-7 text-xs">
							{saving && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
							Save
						</Button>
						<Button variant="ghost" size="sm" onClick={() => setAdding(false)} className="h-7 text-xs">
							Cancel
						</Button>
					</div>
				</div>
			)}

			{blockedDates.length === 0 ? (
				<p className="text-xs text-muted-foreground">No blocked dates.</p>
			) : (
				<div className="space-y-1">
					{blockedDates.map((bd) => (
						<div
							key={bd.id}
							className="flex items-center justify-between rounded-md border px-3 py-2 text-xs"
						>
							<div>
								<span className="font-medium">
									{new Date(bd.date + 'T00:00:00').toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric',
										year: 'numeric',
									})}
								</span>
								{bd.reason && (
									<span className="ml-2 text-muted-foreground">— {bd.reason}</span>
								)}
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6 text-destructive hover:text-destructive"
								onClick={() => handleRemove(bd.id)}
							>
								<Trash2 className="h-3 w-3" />
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
