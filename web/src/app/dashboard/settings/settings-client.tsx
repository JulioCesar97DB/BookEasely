'use client'

import { signOut } from '@/app/(auth)/actions'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import type { Business, Profile, UserRole } from '@/lib/types'
import { Loader2, LogOut } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { updateBusinessSettings, updateProfile } from './actions'

interface Props {
	profile: Profile
	role: UserRole
	business: Pick<Business, 'id' | 'cancellation_policy' | 'cancellation_hours' | 'auto_confirm' | 'buffer_minutes'> | null
}

export function SettingsClient({ profile, role, business }: Props) {
	const [savingProfile, setSavingProfile] = useState(false)
	const [savingBusiness, setSavingBusiness] = useState(false)

	const [profileForm, setProfileForm] = useState({
		full_name: profile.full_name,
		phone: profile.phone,
	})

	const [businessForm, setBusinessForm] = useState({
		cancellation_policy: business?.cancellation_policy ?? '',
		cancellation_hours: business?.cancellation_hours ?? 24,
		auto_confirm: business?.auto_confirm ?? false,
		buffer_minutes: business?.buffer_minutes ?? 0,
	})

	async function handleSaveProfile() {
		setSavingProfile(true)
		const result = await updateProfile(profileForm)
		setSavingProfile(false)
		if (result.error) {
			toast.error(result.error)
		} else {
			toast.success('Profile updated')
		}
	}

	async function handleSaveBusiness() {
		if (!business) return
		setSavingBusiness(true)
		const result = await updateBusinessSettings(business.id, businessForm)
		setSavingBusiness(false)
		if (result.error) {
			toast.error(result.error)
		} else {
			toast.success('Business settings updated')
		}
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
				<p className="mt-1 text-muted-foreground">
					Manage your account and preferences
				</p>
			</div>

			<Tabs defaultValue="profile">
				<TabsList>
					<TabsTrigger value="profile">Profile</TabsTrigger>
					{role === 'business_owner' && (
						<TabsTrigger value="business">Business</TabsTrigger>
					)}
					<TabsTrigger value="account">Account</TabsTrigger>
				</TabsList>

				{/* Profile Tab */}
				<TabsContent value="profile" className="space-y-4 mt-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Personal Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label>Full name</Label>
								<Input
									value={profileForm.full_name}
									onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))}
								/>
							</div>

							<div className="space-y-2">
								<Label>Email</Label>
								<Input value={profile.email} disabled className="bg-muted" />
								<p className="text-xs text-muted-foreground">Email cannot be changed</p>
							</div>

							<div className="space-y-2">
								<Label>Phone</Label>
								<Input
									value={profileForm.phone}
									onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
									placeholder="(555) 123-4567"
								/>
							</div>

							<Button onClick={handleSaveProfile} disabled={savingProfile}>
								{savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Save Changes
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Business Tab */}
				{role === 'business_owner' && (
					<TabsContent value="business" className="space-y-4 mt-6">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Booking Settings</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-2">
									<Label>Cancellation Policy</Label>
									<Textarea
										value={businessForm.cancellation_policy}
										onChange={(e) => setBusinessForm((p) => ({ ...p, cancellation_policy: e.target.value }))}
										placeholder="Describe your cancellation policy..."
										className="min-h-24 resize-none"
									/>
								</div>

								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label>Cancellation Window (hours)</Label>
										<Input
											type="number"
											min={1}
											max={168}
											value={businessForm.cancellation_hours}
											onChange={(e) => setBusinessForm((p) => ({ ...p, cancellation_hours: Number(e.target.value) }))}
										/>
										<p className="text-xs text-muted-foreground">How many hours before the appointment clients can cancel</p>
									</div>

									<div className="space-y-2">
										<Label>Buffer Time (minutes)</Label>
										<Input
											type="number"
											min={0}
											max={120}
											value={businessForm.buffer_minutes}
											onChange={(e) => setBusinessForm((p) => ({ ...p, buffer_minutes: Number(e.target.value) }))}
										/>
										<p className="text-xs text-muted-foreground">Time between consecutive appointments</p>
									</div>
								</div>

								<div className="flex items-center justify-between rounded-lg border p-4">
									<div>
										<p className="text-sm font-medium">Auto-confirm bookings</p>
										<p className="text-xs text-muted-foreground">Automatically confirm new bookings without manual review</p>
									</div>
									<Switch
										checked={businessForm.auto_confirm}
										onCheckedChange={(checked) => setBusinessForm((p) => ({ ...p, auto_confirm: checked }))}
									/>
								</div>

								<Button onClick={handleSaveBusiness} disabled={savingBusiness}>
									{savingBusiness && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									Save Business Settings
								</Button>
							</CardContent>
						</Card>
					</TabsContent>
				)}

				{/* Account Tab */}
				<TabsContent value="account" className="space-y-4 mt-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Appearance</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium">Theme</p>
									<p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
								</div>
								<ThemeToggle />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Account Actions</CardTitle>
						</CardHeader>
						<CardContent>
							<form action={signOut}>
								<Button type="submit" variant="destructive" className="gap-2">
									<LogOut className="h-4 w-4" />
									Sign Out
								</Button>
							</form>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}
