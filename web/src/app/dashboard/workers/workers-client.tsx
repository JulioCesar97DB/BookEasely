'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { ServiceWorker, Worker, WorkerAvailability, WorkerBlockedDate, WorkerInvitation } from '@/lib/types'
import { motion } from 'framer-motion'
import { CalendarOff, ChevronDown, ChevronUp, ClipboardList, Clock, Loader2, Mail, Plus, Trash2, UserPlus, Users, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { addBlockedDate, addSelfAsWorker, cancelInvitation, inviteWorker, removeBlockedDate, updateWorker, upsertWorkerAvailability } from './actions'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface Props {
	businessId: string
	userName: string
	workers: Worker[]
	availability: WorkerAvailability[]
	blockedDates: WorkerBlockedDate[]
	serviceWorkers: ServiceWorker[]
	pendingInvitations: WorkerInvitation[]
	ownerIsWorker: boolean
}

interface WorkerFormState {
	display_name: string
	bio: string
	specialties: string
	is_active: boolean
}

interface InviteFormState {
	email: string
	display_name: string
	bio: string
	specialties: string
}

const emptyWorkerForm: WorkerFormState = {
	display_name: '',
	bio: '',
	specialties: '',
	is_active: true,
}

const emptyInviteForm: InviteFormState = {
	email: '',
	display_name: '',
	bio: '',
	specialties: '',
}

function getAvailabilitySummary(workerAvail: WorkerAvailability[]): string {
	const activeDays = workerAvail.filter((a) => a.is_active).sort((a, b) => a.day_of_week - b.day_of_week)
	if (activeDays.length === 0) return 'No schedule set'

	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
	const times = activeDays[0]
	const timeStr = times ? `${times.start_time.slice(0, 5)}–${times.end_time.slice(0, 5)}` : ''

	// Check for consecutive ranges
	const indices = activeDays.map((d) => d.day_of_week)
	if (indices.length >= 2) {
		const first = indices[0]!
		const last = indices[indices.length - 1]!
		const isConsecutive = indices.every((v, i) => v === first + i)
		if (isConsecutive) {
			return `${dayNames[first]}–${dayNames[last]}, ${timeStr}`
		}
	}

	return `${activeDays.length} days/week, ${timeStr}`
}

export function WorkersClient({
	businessId,
	userName,
	workers,
	availability,
	blockedDates,
	serviceWorkers,
	pendingInvitations,
	ownerIsWorker,
}: Props) {
	const [editSheetOpen, setEditSheetOpen] = useState(false)
	const [inviteSheetOpen, setInviteSheetOpen] = useState(false)
	const [editingWorker, setEditingWorker] = useState<Worker | null>(null)
	const [expandedWorker, setExpandedWorker] = useState<string | null>(null)
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState<WorkerFormState>(emptyWorkerForm)
	const [inviteForm, setInviteForm] = useState<InviteFormState>(emptyInviteForm)

	function openAddSelf() {
		setEditingWorker(null)
		setForm({
			display_name: userName,
			bio: '',
			specialties: '',
			is_active: true,
		})
		setEditSheetOpen(true)
	}

	function openEdit(worker: Worker) {
		setEditingWorker(worker)
		setForm({
			display_name: worker.display_name,
			bio: worker.bio ?? '',
			specialties: worker.specialties?.join(', ') ?? '',
			is_active: worker.is_active,
		})
		setEditSheetOpen(true)
	}

	function openInvite() {
		setInviteForm(emptyInviteForm)
		setInviteSheetOpen(true)
	}

	async function handleSave() {
		if (!form.display_name.trim()) {
			toast.error('Display name is required')
			return
		}

		setSaving(true)
		const data = {
			display_name: form.display_name.trim(),
			bio: form.bio.trim(),
			specialties: form.specialties
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean),
			is_active: form.is_active,
		}

		const result = editingWorker
			? await updateWorker(editingWorker.id, data)
			: await addSelfAsWorker(businessId, data)

		setSaving(false)
		if (result.error) {
			toast.error(result.error)
		} else {
			toast.success(editingWorker ? 'Worker updated' : 'You\'ve been added as a worker')
			setEditSheetOpen(false)
		}
	}

	async function handleInvite() {
		if (!inviteForm.email.trim()) {
			toast.error('Email is required')
			return
		}
		if (!inviteForm.display_name.trim()) {
			toast.error('Display name is required')
			return
		}

		setSaving(true)
		const result = await inviteWorker(businessId, {
			email: inviteForm.email.trim(),
			display_name: inviteForm.display_name.trim(),
			bio: inviteForm.bio.trim(),
			specialties: inviteForm.specialties
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean),
		})

		setSaving(false)
		if (result.error) {
			toast.error(result.error)
		} else {
			toast.success(result.message ?? 'Done')
			setInviteSheetOpen(false)
		}
	}

	async function handleCancelInvitation(id: string) {
		const result = await cancelInvitation(id)
		if (result.error) {
			toast.error(result.error)
		} else {
			toast.success('Invitation cancelled')
		}
	}

	return (
		<div>
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Team</h1>
					<p className="text-muted-foreground">Manage your workers and their availability.</p>
				</div>
				<div className="flex gap-2">
					{!ownerIsWorker && (
						<Button variant="outline" onClick={openAddSelf} className="gap-2">
							<UserPlus className="h-4 w-4" />
							Add Yourself
						</Button>
					)}
					<Button onClick={openInvite} className="gap-2">
						<Mail className="h-4 w-4" />
						Invite Worker
					</Button>
				</div>
			</div>

			{workers.length === 0 && pendingInvitations.length === 0 ? (
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center"
				>
					<div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
						<Users className="h-7 w-7" />
					</div>
					<h3 className="mt-4 text-lg font-semibold">No team members yet</h3>
					<p className="mt-1 max-w-sm text-sm text-muted-foreground">
						Add yourself as a worker or invite team members by email.
					</p>
					<div className="mt-6 flex gap-3">
						<Button variant="outline" onClick={openAddSelf} className="gap-2">
							<UserPlus className="h-4 w-4" />
							Add Yourself
						</Button>
						<Button onClick={openInvite} className="gap-2">
							<Mail className="h-4 w-4" />
							Invite by Email
						</Button>
					</div>
				</motion.div>
			) : (
				<>
					{/* Workers Grid */}
					<div className="grid gap-4 sm:grid-cols-2">
						{workers.map((worker, index) => {
							const workerAvail = availability.filter((a) => a.worker_id === worker.id)
							const workerBlocked = blockedDates.filter((b) => b.worker_id === worker.id)
							const workerServiceCount = serviceWorkers.filter((sw) => sw.worker_id === worker.id).length
							const isExpanded = expandedWorker === worker.id
							const nextBlockedDate = workerBlocked.find((b) => b.date >= new Date().toISOString().split('T')[0]!)
							const availSummary = getAvailabilitySummary(workerAvail)

							return (
								<motion.div
									key={worker.id}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 }}
								>
									<Card className="transition-shadow hover:shadow-md">
										<CardHeader className="pb-3">
											<div className="flex items-start justify-between">
												<div className="flex items-center gap-3">
													<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
														{worker.display_name.charAt(0).toUpperCase()}
													</div>
													<div>
														<CardTitle className="text-base">{worker.display_name}</CardTitle>
														{worker.bio && (
															<p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
																{worker.bio}
															</p>
														)}
													</div>
												</div>
												<Badge variant={worker.is_active ? 'default' : 'secondary'}>
													{worker.is_active ? 'Active' : 'Inactive'}
												</Badge>
											</div>
										</CardHeader>
										<CardContent>
											{/* Stats */}
											<div className="flex flex-wrap gap-3 mb-3 text-xs text-muted-foreground">
												<span className="inline-flex items-center gap-1">
													<ClipboardList className="h-3 w-3" />
													{workerServiceCount} service{workerServiceCount !== 1 ? 's' : ''}
												</span>
												<span className="inline-flex items-center gap-1">
													<Clock className="h-3 w-3" />
													{availSummary}
												</span>
												{nextBlockedDate && (
													<span className="inline-flex items-center gap-1 text-amber-600">
														<CalendarOff className="h-3 w-3" />
														Off {new Date(nextBlockedDate.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
													</span>
												)}
											</div>

											{/* Specialties */}
											{worker.specialties && worker.specialties.length > 0 && (
												<div className="flex flex-wrap gap-1.5 mb-3">
													{worker.specialties.map((spec) => (
														<Badge key={spec} variant="outline" className="text-xs">
															{spec}
														</Badge>
													))}
												</div>
											)}

											{/* Member since */}
											<p className="text-[11px] text-muted-foreground/60 mb-3">
												Member since {new Date(worker.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
											</p>

											<div className="flex gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => openEdit(worker)}
												>
													Edit
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														setExpandedWorker(isExpanded ? null : worker.id)
													}
													className="gap-1"
												>
													{isExpanded ? (
														<>
															<ChevronUp className="h-4 w-4" />
															Less
														</>
													) : (
														<>
															<ChevronDown className="h-4 w-4" />
															Schedule
														</>
													)}
												</Button>
											</div>

											{isExpanded && (
												<motion.div
													initial={{ height: 0, opacity: 0 }}
													animate={{ height: 'auto', opacity: 1 }}
													exit={{ height: 0, opacity: 0 }}
													transition={{ duration: 0.2 }}
													className="mt-4 space-y-4 border-t pt-4"
												>
													<AvailabilitySection
														workerId={worker.id}
														availability={workerAvail}
													/>
													<BlockedDatesSection
														workerId={worker.id}
														blockedDates={workerBlocked}
													/>
												</motion.div>
											)}
										</CardContent>
									</Card>
								</motion.div>
							)
						})}
					</div>

					{/* Pending Invitations */}
					{pendingInvitations.length > 0 && (
						<div className="mt-8">
							<h2 className="text-lg font-semibold mb-4">Pending Invitations</h2>
							<div className="space-y-2">
								{pendingInvitations.map((inv) => (
									<div
										key={inv.id}
										className="flex items-center justify-between rounded-lg border px-4 py-3"
									>
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
												<Mail className="h-4 w-4" />
											</div>
											<div>
												<p className="text-sm font-medium">{inv.display_name}</p>
												<p className="text-xs text-muted-foreground">{inv.email}</p>
											</div>
										</div>
										<div className="flex items-center gap-3">
											<Badge variant="outline" className="text-amber-600 border-amber-300">
												Pending
											</Badge>
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 text-muted-foreground hover:text-destructive"
												onClick={() => handleCancelInvitation(inv.id)}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</>
			)}

			{/* Edit Worker Sheet */}
			<Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
				<SheetContent className="overflow-y-auto">
					<SheetHeader>
						<SheetTitle>{editingWorker ? 'Edit Worker' : 'Add Yourself'}</SheetTitle>
						<SheetDescription>
							{editingWorker
								? 'Update worker details.'
								: 'Add yourself as a team member.'}
						</SheetDescription>
					</SheetHeader>

					<div className="mt-6 space-y-6">
						<div className="space-y-2">
							<Label>Display name</Label>
							<Input
								value={form.display_name}
								onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))}
								placeholder="John Doe"
							/>
						</div>

						<div className="space-y-2">
							<Label>Bio</Label>
							<Textarea
								value={form.bio}
								onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
								placeholder="Brief description..."
								className="min-h-20 resize-none"
							/>
						</div>

						<div className="space-y-2">
							<Label>Specialties</Label>
							<Input
								value={form.specialties}
								onChange={(e) => setForm((p) => ({ ...p, specialties: e.target.value }))}
								placeholder="Haircuts, Coloring, Styling"
							/>
							<p className="text-xs text-muted-foreground">Separate with commas</p>
						</div>

						<div className="flex items-center justify-between rounded-lg border p-4">
							<div>
								<p className="text-sm font-medium">Active</p>
								<p className="text-xs text-muted-foreground">Available for bookings</p>
							</div>
							<Switch
								checked={form.is_active}
								onCheckedChange={(checked) => setForm((p) => ({ ...p, is_active: checked }))}
							/>
						</div>

						<div className="flex gap-3 pt-4">
							<Button variant="outline" className="flex-1" onClick={() => setEditSheetOpen(false)}>
								Cancel
							</Button>
							<Button className="flex-1" onClick={handleSave} disabled={saving}>
								{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{editingWorker ? 'Update' : 'Add Yourself'}
							</Button>
						</div>
					</div>
				</SheetContent>
			</Sheet>

			{/* Invite Worker Sheet */}
			<Sheet open={inviteSheetOpen} onOpenChange={setInviteSheetOpen}>
				<SheetContent className="overflow-y-auto">
					<SheetHeader>
						<SheetTitle>Invite Worker</SheetTitle>
						<SheetDescription>
							Invite a team member by email. If they already have an account, they&apos;ll be added instantly. Otherwise, they&apos;ll be linked when they sign up.
						</SheetDescription>
					</SheetHeader>

					<div className="mt-6 space-y-6">
						<div className="space-y-2">
							<Label>Email</Label>
							<Input
								type="email"
								value={inviteForm.email}
								onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
								placeholder="worker@example.com"
							/>
						</div>

						<div className="space-y-2">
							<Label>Display name</Label>
							<Input
								value={inviteForm.display_name}
								onChange={(e) => setInviteForm((p) => ({ ...p, display_name: e.target.value }))}
								placeholder="John Doe"
							/>
						</div>

						<div className="space-y-2">
							<Label>Bio</Label>
							<Textarea
								value={inviteForm.bio}
								onChange={(e) => setInviteForm((p) => ({ ...p, bio: e.target.value }))}
								placeholder="Brief description..."
								className="min-h-20 resize-none"
							/>
						</div>

						<div className="space-y-2">
							<Label>Specialties</Label>
							<Input
								value={inviteForm.specialties}
								onChange={(e) => setInviteForm((p) => ({ ...p, specialties: e.target.value }))}
								placeholder="Haircuts, Coloring, Styling"
							/>
							<p className="text-xs text-muted-foreground">Separate with commas</p>
						</div>

						<div className="flex gap-3 pt-4">
							<Button variant="outline" className="flex-1" onClick={() => setInviteSheetOpen(false)}>
								Cancel
							</Button>
							<Button className="flex-1" onClick={handleInvite} disabled={saving}>
								{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Send Invitation
							</Button>
						</div>
					</div>
				</SheetContent>
			</Sheet>
		</div>
	)
}

function AvailabilitySection({
	workerId,
	availability,
}: {
	workerId: string
	availability: WorkerAvailability[]
}) {
	const [saving, setSaving] = useState(false)
	const [schedule, setSchedule] = useState(() =>
		DAYS.map((_, i) => {
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
						<div className="w-16 font-medium text-xs">{DAYS[index]?.slice(0, 3)}</div>
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

function BlockedDatesSection({
	workerId,
	blockedDates,
}: {
	workerId: string
	blockedDates: WorkerBlockedDate[]
}) {
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
