'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

export interface WorkerFormState {
	display_name: string
	bio: string
	specialties: string
	is_active: boolean
}

interface WorkerEditSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	isEditing: boolean
	form: WorkerFormState
	onFormChange: (updater: (prev: WorkerFormState) => WorkerFormState) => void
	onSave: () => void
	saving: boolean
}

export function WorkerEditSheet({
	open,
	onOpenChange,
	isEditing,
	form,
	onFormChange,
	onSave,
	saving,
}: WorkerEditSheetProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="overflow-y-auto">
				<SheetHeader>
					<SheetTitle>{isEditing ? 'Edit Worker' : 'Add Yourself'}</SheetTitle>
					<SheetDescription>
						{isEditing
							? 'Update worker details.'
							: 'Add yourself as a team member.'}
					</SheetDescription>
				</SheetHeader>

				<div className="mt-6 space-y-6">
					<div className="space-y-2">
						<Label>Display name</Label>
						<Input
							value={form.display_name}
							onChange={(e) => onFormChange((p) => ({ ...p, display_name: e.target.value }))}
							placeholder="John Doe"
						/>
					</div>

					<div className="space-y-2">
						<Label>Bio</Label>
						<Textarea
							value={form.bio}
							onChange={(e) => onFormChange((p) => ({ ...p, bio: e.target.value }))}
							placeholder="Brief description..."
							className="min-h-20 resize-none"
						/>
					</div>

					<div className="space-y-2">
						<Label>Specialties</Label>
						<Input
							value={form.specialties}
							onChange={(e) => onFormChange((p) => ({ ...p, specialties: e.target.value }))}
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
							onCheckedChange={(checked) => onFormChange((p) => ({ ...p, is_active: checked }))}
						/>
					</div>

					<div className="flex gap-3 pt-4">
						<Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button className="flex-1" onClick={onSave} disabled={saving}>
							{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{isEditing ? 'Update' : 'Add Yourself'}
						</Button>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	)
}
