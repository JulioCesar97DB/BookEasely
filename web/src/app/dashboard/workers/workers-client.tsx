'use client'

import { PageTransition } from '@/components/page-transition'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ServiceWorker, Worker, WorkerAvailability, WorkerBlockedDate, WorkerInvitation } from '@/lib/types'
import { motion } from 'framer-motion'
import { Mail, UserPlus, Users, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { addSelfAsWorker, cancelInvitation, inviteWorker, updateWorker } from './actions'
import { WorkerCard } from './components/worker-card'
import { WorkerEditSheet, type WorkerFormState } from './components/worker-edit-sheet'
import { WorkerInviteSheet, type InviteFormState } from './components/worker-invite-sheet'

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
		<PageTransition>
			<div>
				<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Team</h1>
						<p className="text-muted-foreground">Manage your workers and their availability.</p>
					</div>
					<div className="flex gap-2">
						{!ownerIsWorker && (
							<Button variant="outline" onClick={openAddSelf} className="gap-2 flex-1 sm:flex-initial">
								<UserPlus className="h-4 w-4" />
								Add Yourself
							</Button>
						)}
						<Button onClick={openInvite} className="gap-2 flex-1 sm:flex-initial">
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
							{workers.map((worker, index) => (
								<WorkerCard
									key={worker.id}
									worker={worker}
									index={index}
									workerAvailability={availability.filter((a) => a.worker_id === worker.id)}
									workerBlockedDates={blockedDates.filter((b) => b.worker_id === worker.id)}
									workerServiceCount={serviceWorkers.filter((sw) => sw.worker_id === worker.id).length}
									isExpanded={expandedWorker === worker.id}
									onEdit={openEdit}
									onToggleExpand={(id) => setExpandedWorker(expandedWorker === id ? null : id)}
								/>
							))}
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

				<WorkerEditSheet
					open={editSheetOpen}
					onOpenChange={setEditSheetOpen}
					isEditing={!!editingWorker}
					form={form}
					onFormChange={setForm}
					onSave={handleSave}
					saving={saving}
				/>

				<WorkerInviteSheet
					open={inviteSheetOpen}
					onOpenChange={setInviteSheetOpen}
					form={inviteForm}
					onFormChange={setInviteForm}
					onInvite={handleInvite}
					saving={saving}
				/>
			</div>
		</PageTransition>
	)
}
