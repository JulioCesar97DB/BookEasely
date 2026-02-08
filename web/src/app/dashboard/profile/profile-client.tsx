'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Profile, UserRole } from '@/lib/types'
import { Calendar, Loader2, Search, Store } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { updateProfile } from '../settings/actions'

interface Props {
	profile: Profile
	role: UserRole
	businessName: string | null
}

export function ProfileClient({ profile, role, businessName }: Props) {
	const [editing, setEditing] = useState(false)
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState({
		full_name: profile.full_name,
		phone: profile.phone,
	})

	async function handleSave() {
		if (!form.full_name.trim()) {
			toast.error('Name is required')
			return
		}
		setSaving(true)
		const result = await updateProfile(form)
		setSaving(false)
		if (result.error) {
			toast.error(result.error)
		} else {
			toast.success('Profile updated')
			setEditing(false)
		}
	}

	const roleLabel = role === 'business_owner' ? 'Business Owner' : role === 'worker' ? 'Worker' : 'Client'

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Profile</h1>
				<p className="mt-1 text-muted-foreground">
					Your personal information
				</p>
			</div>

			<Card>
				<CardContent className="pt-6">
					<div className="flex items-start gap-6">
						{/* Avatar */}
						<div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">
							{profile.full_name.charAt(0).toUpperCase()}
						</div>

						<div className="flex-1 space-y-4">
							{editing ? (
								<>
									<div className="space-y-2">
										<Label>Full name</Label>
										<Input
											value={form.full_name}
											onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
										/>
									</div>
									<div className="space-y-2">
										<Label>Phone</Label>
										<Input
											value={form.phone}
											onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
											placeholder="(555) 123-4567"
										/>
									</div>
									<div className="flex gap-2">
										<Button onClick={handleSave} disabled={saving}>
											{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
											Save
										</Button>
										<Button variant="outline" onClick={() => { setEditing(false); setForm({ full_name: profile.full_name, phone: profile.phone }) }}>
											Cancel
										</Button>
									</div>
								</>
							) : (
								<>
									<div>
										<h2 className="text-xl font-semibold">{profile.full_name}</h2>
										<p className="text-sm text-muted-foreground">{profile.email}</p>
										{profile.phone && (
											<p className="text-sm text-muted-foreground mt-0.5">{profile.phone}</p>
										)}
									</div>
									<div className="flex items-center gap-3">
										<Badge variant="secondary">{roleLabel}</Badge>
										<span className="flex items-center gap-1 text-xs text-muted-foreground">
											<Calendar className="h-3 w-3" />
											Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
										</span>
									</div>
									<Button variant="outline" size="sm" onClick={() => setEditing(true)}>
										Edit Profile
									</Button>
								</>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Role-specific links */}
			{role === 'business_owner' && businessName && (
				<Link href="/dashboard/business">
					<Card className="transition-all hover:shadow-md hover:border-primary/30 cursor-pointer">
						<CardHeader className="pb-3">
							<CardTitle className="text-base flex items-center gap-2">
								<Store className="h-4 w-4 text-primary" />
								Manage Business
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">{businessName}</p>
						</CardContent>
					</Card>
				</Link>
			)}

			{role === 'client' && (
				<Link href="/dashboard/discover">
					<Card className="transition-all hover:shadow-md hover:border-primary/30 cursor-pointer">
						<CardHeader className="pb-3">
							<CardTitle className="text-base flex items-center gap-2">
								<Search className="h-4 w-4 text-primary" />
								Browse Services
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Discover and book services near you</p>
						</CardContent>
					</Card>
				</Link>
			)}
		</div>
	)
}
