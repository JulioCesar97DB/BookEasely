'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Loader2, Mail, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { respondToInvitation } from '../workers/actions'

interface Invitation {
	id: string
	business_id: string
	display_name: string
	businesses: { name: string } | null
}

export function PendingInvitations({ invitations }: { invitations: Invitation[] }) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	if (invitations.length === 0) return null

	function handleRespond(invitationId: string, accept: boolean) {
		startTransition(async () => {
			const result = await respondToInvitation(invitationId, accept)
			if (result.error) {
				toast.error(result.error)
			} else {
				toast.success(accept ? 'Invitation accepted!' : 'Invitation declined')
				router.refresh()
			}
		})
	}

	return (
		<div>
			<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
				<Mail className="h-5 w-5" />
				Pending Invitations
			</h2>
			<div className="space-y-3">
				{invitations.map((inv) => (
					<Card key={inv.id}>
						<CardContent className="flex items-center gap-4 py-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
								<Mail className="h-5 w-5 text-amber-600 dark:text-amber-400" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="font-medium truncate">
									{inv.businesses?.name ?? 'A business'}
								</p>
								<p className="text-sm text-muted-foreground truncate">
									Invited as {inv.display_name}
								</p>
							</div>
							<div className="flex gap-2">
								<Button
									size="sm"
									variant="outline"
									disabled={isPending}
									onClick={() => handleRespond(inv.id, false)}
								>
									{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
									<span className="sr-only sm:not-sr-only sm:ml-1">Decline</span>
								</Button>
								<Button
									size="sm"
									disabled={isPending}
									onClick={() => handleRespond(inv.id, true)}
								>
									{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
									<span className="sr-only sm:not-sr-only sm:ml-1">Accept</span>
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
}
