'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

export interface InviteFormState {
	email: string
	display_name: string
	bio: string
	specialties: string
}

interface WorkerInviteSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	form: InviteFormState
	onFormChange: (updater: (prev: InviteFormState) => InviteFormState) => void
	onInvite: () => void
	saving: boolean
}

export function WorkerInviteSheet({
	open,
	onOpenChange,
	form,
	onFormChange,
	onInvite,
	saving,
}: WorkerInviteSheetProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
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
							value={form.email}
							onChange={(e) => onFormChange((p) => ({ ...p, email: e.target.value }))}
							placeholder="worker@example.com"
						/>
					</div>

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

					<div className="flex gap-3 pt-4">
						<Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button className="flex-1" onClick={onInvite} disabled={saving}>
							{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Send Invitation
						</Button>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	)
}
