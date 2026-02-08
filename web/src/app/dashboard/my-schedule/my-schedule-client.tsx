'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { WorkerAvailability, WorkerBlockedDate } from '@/lib/types'
import { cn } from '@/lib/utils'
import { CalendarOff, Loader2, Plus, Save, Trash2, X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { addBlockedDate, removeBlockedDate, upsertWorkerAvailability } from '../workers/actions'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface WorkerInfo {
	id: string
	display_name: string
	business_id: string
	business_name: string
}

interface Props {
	workers: WorkerInfo[]
	availability: WorkerAvailability[]
	blockedDates: WorkerBlockedDate[]
}

interface AvailEntry {
	day_of_week: number
	start_time: string
	end_time: string
	is_active: boolean
}

function buildAvail(data: WorkerAvailability[]): AvailEntry[] {
	return DAYS.map((_, i) => {
		const existing = data.find((a) => a.day_of_week === i)
		return {
			day_of_week: i,
			start_time: existing?.start_time?.slice(0, 5) ?? '09:00',
			end_time: existing?.end_time?.slice(0, 5) ?? '17:00',
			is_active: existing?.is_active ?? (i !== 0 && i !== 6),
		}
	})
}

export function MyScheduleClient({ workers, availability, blockedDates }: Props) {
	const [selectedWorkerIdx, setSelectedWorkerIdx] = useState(0)
	const selectedWorker = workers[selectedWorkerIdx]!

	// Availability state for selected worker
	const workerAvail = availability.filter((a) => a.worker_id === selectedWorker.id)
	const [avail, setAvail] = useState<AvailEntry[]>(() => buildAvail(workerAvail))
	const [savingAvail, startSavingAvail] = useTransition()

	// Blocked dates state for selected worker
	const workerBlocked = blockedDates.filter((b) => b.worker_id === selectedWorker.id)
	const [blocked, setBlocked] = useState<WorkerBlockedDate[]>(workerBlocked)
	const [addingDate, setAddingDate] = useState(false)
	const [newDate, setNewDate] = useState('')
	const [newReason, setNewReason] = useState('')
	const [savingDate, startSavingDate] = useTransition()

	function switchWorker(idx: number) {
		setSelectedWorkerIdx(idx)
		const w = workers[idx]!
		const wa = availability.filter((a) => a.worker_id === w.id)
		const wb = blockedDates.filter((b) => b.worker_id === w.id)
		setAvail(buildAvail(wa))
		setBlocked(wb)
		setAddingDate(false)
	}

	function updateAvail(dayIdx: number, field: string, value: string | boolean) {
		setAvail((prev) => prev.map((a, i) => (i === dayIdx ? { ...a, [field]: value } : a)))
	}

	function handleSaveAvailability() {
		startSavingAvail(async () => {
			const result = await upsertWorkerAvailability(selectedWorker.id, avail)
			if (result.error) {
				toast.error(result.error)
			} else {
				toast.success('Availability saved')
			}
		})
	}

	function handleAddBlockedDate() {
		if (!newDate.trim()) {
			toast.error('Please enter a date')
			return
		}
		startSavingDate(async () => {
			const result = await addBlockedDate(selectedWorker.id, {
				date: newDate.trim(),
				reason: newReason.trim() || undefined,
			})
			if (result.error) {
				toast.error(result.error)
			} else {
				toast.success('Blocked date added')
				setBlocked((prev) => [...prev, {
					id: crypto.randomUUID(),
					worker_id: selectedWorker.id,
					date: newDate.trim(),
					start_time: null,
					end_time: null,
					reason: newReason.trim() || null,
				}])
				setNewDate('')
				setNewReason('')
				setAddingDate(false)
			}
		})
	}

	function handleRemoveBlockedDate(id: string) {
		startSavingDate(async () => {
			const result = await removeBlockedDate(id)
			if (result.error) {
				toast.error(result.error)
			} else {
				setBlocked((prev) => prev.filter((b) => b.id !== id))
				toast.success('Blocked date removed')
			}
		})
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">My Schedule</h1>
				<p className="text-muted-foreground">Manage your availability and time off.</p>
			</div>

			{/* Worker selector (if multiple businesses) */}
			{workers.length > 1 && (
				<div className="flex flex-wrap gap-2">
					{workers.map((w, idx) => (
						<button
							key={w.id}
							onClick={() => switchWorker(idx)}
							className={cn(
								'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
								idx === selectedWorkerIdx
									? 'bg-primary/10 border-primary/30 text-primary'
									: 'bg-muted text-muted-foreground hover:bg-muted/80'
							)}
						>
							{w.business_name}
							{idx === selectedWorkerIdx && <Badge variant="secondary" className="text-xs">Active</Badge>}
						</button>
					))}
				</div>
			)}

			{workers.length === 1 && (
				<p className="text-sm text-muted-foreground">
					Schedule for <span className="font-medium text-foreground">{selectedWorker.business_name}</span>
				</p>
			)}

			{/* Weekly Availability */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="text-lg">Weekly Availability</CardTitle>
					<Button size="sm" onClick={handleSaveAvailability} disabled={savingAvail}>
						{savingAvail ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
						Save
					</Button>
				</CardHeader>
				<CardContent className="space-y-3">
					{avail.map((entry, idx) => (
						<div
							key={entry.day_of_week}
							className={cn(
								'flex items-center gap-4 rounded-lg border p-3 transition-colors',
								entry.is_active ? 'bg-background' : 'bg-muted/50'
							)}
						>
							<div className="w-28 shrink-0">
								<p className="text-sm font-medium">{DAYS[idx]}</p>
							</div>
							<Switch
								checked={entry.is_active}
								onCheckedChange={(v) => updateAvail(idx, 'is_active', v)}
							/>
							{entry.is_active ? (
								<div className="flex items-center gap-2">
									<Input
										type="time"
										value={entry.start_time}
										onChange={(e) => updateAvail(idx, 'start_time', e.target.value)}
										className="w-32"
									/>
									<span className="text-muted-foreground text-sm">to</span>
									<Input
										type="time"
										value={entry.end_time}
										onChange={(e) => updateAvail(idx, 'end_time', e.target.value)}
										className="w-32"
									/>
								</div>
							) : (
								<span className="text-sm text-muted-foreground">Day off</span>
							)}
						</div>
					))}
				</CardContent>
			</Card>

			{/* Blocked Dates */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="text-lg">Time Off</CardTitle>
					{!addingDate && (
						<Button size="sm" variant="outline" onClick={() => setAddingDate(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Add
						</Button>
					)}
				</CardHeader>
				<CardContent className="space-y-3">
					{addingDate && (
						<div className="flex items-end gap-3 rounded-lg border p-3 bg-muted/30">
							<div className="space-y-1.5">
								<Label className="text-xs">Date</Label>
								<Input
									type="date"
									value={newDate}
									onChange={(e) => setNewDate(e.target.value)}
									className="w-40"
								/>
							</div>
							<div className="space-y-1.5 flex-1">
								<Label className="text-xs">Reason (optional)</Label>
								<Input
									value={newReason}
									onChange={(e) => setNewReason(e.target.value)}
									placeholder="Vacation, personal day..."
								/>
							</div>
							<Button size="sm" onClick={handleAddBlockedDate} disabled={savingDate}>
								{savingDate ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
							</Button>
							<Button size="sm" variant="ghost" onClick={() => { setAddingDate(false); setNewDate(''); setNewReason('') }}>
								<X className="h-4 w-4" />
							</Button>
						</div>
					)}

					{blocked.length === 0 && !addingDate ? (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<CalendarOff className="h-8 w-8 text-muted-foreground/30" />
							<p className="mt-2 text-sm text-muted-foreground">No blocked dates</p>
							<p className="text-xs text-muted-foreground/70">Add dates when you&apos;re not available</p>
						</div>
					) : (
						blocked.map((bd) => (
							<div key={bd.id} className="flex items-center justify-between rounded-lg border p-3">
								<div>
									<p className="text-sm font-medium">{bd.date}</p>
									{bd.reason && <p className="text-xs text-muted-foreground">{bd.reason}</p>}
								</div>
								<Button
									size="icon"
									variant="ghost"
									className="text-destructive hover:text-destructive"
									onClick={() => handleRemoveBlockedDate(bd.id)}
									disabled={savingDate}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						))
					)}
				</CardContent>
			</Card>
		</div>
	)
}
