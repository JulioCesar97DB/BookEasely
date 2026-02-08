'use client'

import { PageTransition } from '@/components/page-transition'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import type { Service, ServiceWorker, Worker } from '@/lib/types'
import { motion } from 'framer-motion'
import { ClipboardList, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { createService, deleteService, updateService } from './actions'

interface Props {
	businessId: string
	services: Service[]
	workers: Pick<Worker, 'id' | 'display_name' | 'is_active'>[]
	serviceWorkers: Pick<ServiceWorker, 'service_id' | 'worker_id'>[]
}

const DURATIONS = [
	{ value: 15, label: '15 min' },
	{ value: 30, label: '30 min' },
	{ value: 45, label: '45 min' },
	{ value: 60, label: '1 hour' },
	{ value: 90, label: '1h 30min' },
	{ value: 120, label: '2 hours' },
	{ value: 180, label: '3 hours' },
	{ value: 240, label: '4 hours' },
]

interface FormState {
	name: string
	description: string
	price: string
	duration_minutes: number
	is_active: boolean
	worker_ids: string[]
}

const emptyForm: FormState = {
	name: '',
	description: '',
	price: '',
	duration_minutes: 30,
	is_active: true,
	worker_ids: [],
}

export function ServicesClient({ businessId, services, workers, serviceWorkers }: Props) {
	const [sheetOpen, setSheetOpen] = useState(false)
	const [editingService, setEditingService] = useState<Service | null>(null)
	const [deleteId, setDeleteId] = useState<string | null>(null)
	const [saving, setSaving] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [form, setForm] = useState<FormState>(emptyForm)

	function openAdd() {
		setEditingService(null)
		setForm(emptyForm)
		setSheetOpen(true)
	}

	function openEdit(service: Service) {
		setEditingService(service)
		const assignedWorkers = serviceWorkers
			.filter((sw) => sw.service_id === service.id)
			.map((sw) => sw.worker_id)
		setForm({
			name: service.name,
			description: service.description ?? '',
			price: service.price.toString(),
			duration_minutes: service.duration_minutes,
			is_active: service.is_active,
			worker_ids: assignedWorkers,
		})
		setSheetOpen(true)
	}

	function toggleWorker(workerId: string) {
		setForm((prev) => ({
			...prev,
			worker_ids: prev.worker_ids.includes(workerId)
				? prev.worker_ids.filter((id) => id !== workerId)
				: [...prev.worker_ids, workerId],
		}))
	}

	async function handleSave() {
		const price = parseFloat(form.price)
		if (isNaN(price) || price < 0.01) {
			toast.error('Please enter a valid price')
			return
		}
		if (!form.name.trim()) {
			toast.error('Service name is required')
			return
		}

		setSaving(true)
		const data = {
			name: form.name.trim(),
			description: form.description.trim(),
			price,
			duration_minutes: form.duration_minutes,
			is_active: form.is_active,
		}

		const result = editingService
			? await updateService(editingService.id, data, form.worker_ids)
			: await createService(businessId, data, form.worker_ids)

		setSaving(false)
		if (result.error) {
			toast.error(result.error)
		} else {
			toast.success(editingService ? 'Service updated' : 'Service created')
			setSheetOpen(false)
		}
	}

	async function handleDelete() {
		if (!deleteId) return
		setDeleting(true)
		const result = await deleteService(deleteId)
		setDeleting(false)
		if (result.error) {
			toast.error(result.error)
		} else {
			toast.success('Service deleted')
			setDeleteId(null)
		}
	}

	return (
		<PageTransition>
			<div>
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Services</h1>
						<p className="text-muted-foreground">Manage the services your business offers.</p>
					</div>
					<Button onClick={openAdd} className="gap-2">
						<Plus className="h-4 w-4" />
						Add Service
					</Button>
				</div>

				{services.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center"
					>
						<div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
							<ClipboardList className="h-7 w-7" />
						</div>
						<h3 className="mt-4 text-lg font-semibold">No services yet</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							Add your first service to start accepting bookings.
						</p>
						<Button onClick={openAdd} className="mt-6 gap-2">
							<Plus className="h-4 w-4" />
							Add your first service
						</Button>
					</motion.div>
				) : (
					<div className="rounded-xl border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Price</TableHead>
									<TableHead>Duration</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="w-24">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{services.map((service, index) => (
									<motion.tr
										key={service.id}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: index * 0.05 }}
										className="border-b transition-colors hover:bg-muted/50"
									>
										<TableCell>
											<div>
												<p className="font-medium">{service.name}</p>
												{service.description && (
													<p className="text-sm text-muted-foreground line-clamp-1">
														{service.description}
													</p>
												)}
											</div>
										</TableCell>
										<TableCell className="font-medium">
											${service.price.toFixed(2)}
										</TableCell>
										<TableCell>{service.duration_minutes} min</TableCell>
										<TableCell>
											<Badge variant={service.is_active ? 'default' : 'secondary'}>
												{service.is_active ? 'Active' : 'Inactive'}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1">
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													onClick={() => openEdit(service)}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-destructive hover:text-destructive"
													onClick={() => setDeleteId(service.id)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</motion.tr>
								))}
							</TableBody>
						</Table>
					</div>
				)}

				{/* Add/Edit Sheet */}
				<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
					<SheetContent className="overflow-y-auto">
						<SheetHeader>
							<SheetTitle>{editingService ? 'Edit Service' : 'Add Service'}</SheetTitle>
							<SheetDescription>
								{editingService
									? 'Update the details of this service.'
									: 'Fill in the details for your new service.'}
							</SheetDescription>
						</SheetHeader>

						<div className="mt-6 space-y-6">
							<div className="space-y-2">
								<Label>Service name</Label>
								<Input
									value={form.name}
									onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
									placeholder="Haircut"
								/>
							</div>

							<div className="space-y-2">
								<Label>Description</Label>
								<Textarea
									value={form.description}
									onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
									placeholder="Describe this service..."
									className="min-h-20 resize-none"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Price ($)</Label>
									<Input
										type="number"
										step="0.01"
										min="0.01"
										value={form.price}
										onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
										placeholder="25.00"
									/>
								</div>

								<div className="space-y-2">
									<Label>Duration</Label>
									<Select
										value={form.duration_minutes.toString()}
										onValueChange={(v) => setForm((p) => ({ ...p, duration_minutes: parseInt(v) }))}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{DURATIONS.map((d) => (
												<SelectItem key={d.value} value={d.value.toString()}>
													{d.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="flex items-center justify-between rounded-lg border p-4">
								<div>
									<p className="text-sm font-medium">Active</p>
									<p className="text-xs text-muted-foreground">
										Visible to clients for booking
									</p>
								</div>
								<Switch
									checked={form.is_active}
									onCheckedChange={(checked) => setForm((p) => ({ ...p, is_active: checked }))}
								/>
							</div>

							{workers.length > 0 && (
								<div className="space-y-3">
									<Label>Assign workers</Label>
									<p className="text-xs text-muted-foreground">
										Select which team members can perform this service.
									</p>
									<div className="space-y-2">
										{workers.map((worker) => (
											<label
												key={worker.id}
												className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
											>
												<input
													type="checkbox"
													checked={form.worker_ids.includes(worker.id)}
													onChange={() => toggleWorker(worker.id)}
													className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
												/>
												<span className="text-sm font-medium">{worker.display_name}</span>
											</label>
										))}
									</div>
								</div>
							)}

							<div className="flex gap-3 pt-4">
								<Button
									variant="outline"
									className="flex-1"
									onClick={() => setSheetOpen(false)}
								>
									Cancel
								</Button>
								<Button
									className="flex-1"
									onClick={handleSave}
									disabled={saving}
								>
									{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									{editingService ? 'Update' : 'Create'}
								</Button>
							</div>
						</div>
					</SheetContent>
				</Sheet>

				{/* Delete Confirmation */}
				<AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete service?</AlertDialogTitle>
							<AlertDialogDescription>
								This will permanently remove this service. Existing bookings for this service will not be affected.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDelete}
								disabled={deleting}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								{deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</PageTransition>
	)
}
