'use client'

import { BusinessPhotoUpload } from '@/components/business-photo-upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import type { Business, BusinessHours, Category } from '@/lib/types'
import { businessProfileSchema, type BusinessProfileInput } from '@/lib/validations/business'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { Building2, Clock, Loader2, Settings, Store } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { updateBusinessHours, updateBusinessProfile, updateBusinessSettings } from './actions'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface Props {
	business: Business
	categories: Pick<Category, 'id' | 'name' | 'slug'>[]
	hours: BusinessHours[]
}

export function BusinessClient({ business, categories, hours: initialHours }: Props) {
	const [activeTab, setActiveTab] = useState('profile')

	return (
		<div>
			<div className="mb-8">
				<h1 className="text-2xl font-bold tracking-tight">Business</h1>
				<p className="text-muted-foreground">Manage your business profile, hours, and settings.</p>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="mb-6">
					<TabsTrigger value="profile" className="gap-2">
						<Store className="h-4 w-4" />
						Profile
					</TabsTrigger>
					<TabsTrigger value="hours" className="gap-2">
						<Clock className="h-4 w-4" />
						Hours
					</TabsTrigger>
					<TabsTrigger value="settings" className="gap-2">
						<Settings className="h-4 w-4" />
						Settings
					</TabsTrigger>
				</TabsList>

				<AnimatePresence mode="wait">
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.2 }}
					>
						<TabsContent value="profile" forceMount={activeTab === 'profile' ? true : undefined} className={activeTab !== 'profile' ? 'hidden' : ''}>
							<ProfileTab business={business} categories={categories} />
						</TabsContent>
						<TabsContent value="hours" forceMount={activeTab === 'hours' ? true : undefined} className={activeTab !== 'hours' ? 'hidden' : ''}>
							<HoursTab businessId={business.id} initialHours={initialHours} />
						</TabsContent>
						<TabsContent value="settings" forceMount={activeTab === 'settings' ? true : undefined} className={activeTab !== 'settings' ? 'hidden' : ''}>
							<SettingsTab business={business} />
						</TabsContent>
					</motion.div>
				</AnimatePresence>
			</Tabs>
		</div>
	)
}

function ProfileTab({ business, categories }: { business: Business; categories: Pick<Category, 'id' | 'name' | 'slug'>[] }) {
	const [saving, setSaving] = useState(false)

	const form = useForm<BusinessProfileInput>({
		resolver: zodResolver(businessProfileSchema),
		defaultValues: {
			name: business.name,
			description: business.description ?? '',
			category_id: business.category_id,
			address: business.address,
			city: business.city,
			state: business.state,
			zip_code: business.zip_code,
			phone: business.phone,
			email: business.email ?? '',
			website: business.website ?? '',
		},
	})

	async function onSubmit(data: BusinessProfileInput) {
		setSaving(true)
		const result = await updateBusinessProfile(business.id, data)
		setSaving(false)
		if (result.error) {
			toast.error(result.error)
		} else {
			toast.success('Business profile updated')
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Building2 className="h-5 w-5" />
					Business Profile
				</CardTitle>
				<CardDescription>Update your business information visible to clients.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<BusinessPhotoUpload businessId={business.id} initialPhotos={business.photos ?? []} />

				<Separator />

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<div className="grid gap-6 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Business name</FormLabel>
										<FormControl>
											<Input placeholder="My Business" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="category_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Category</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select category" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{categories.map((cat) => (
													<SelectItem key={cat.id} value={cat.id}>
														{cat.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Tell clients about your business..."
											className="min-h-24 resize-none"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Separator />

						<div className="grid gap-6 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Phone</FormLabel>
										<FormControl>
											<Input placeholder="+1 (555) 000-0000" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input type="email" placeholder="contact@business.com" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="website"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Website</FormLabel>
									<FormControl>
										<Input placeholder="https://mybusiness.com" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Separator />

						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Address</FormLabel>
									<FormControl>
										<Input placeholder="123 Main St" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid gap-6 sm:grid-cols-3">
							<FormField
								control={form.control}
								name="city"
								render={({ field }) => (
									<FormItem>
										<FormLabel>City</FormLabel>
										<FormControl>
											<Input placeholder="New York" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="state"
								render={({ field }) => (
									<FormItem>
										<FormLabel>State</FormLabel>
										<FormControl>
											<Input placeholder="NY" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="zip_code"
								render={({ field }) => (
									<FormItem>
										<FormLabel>ZIP Code</FormLabel>
										<FormControl>
											<Input placeholder="10001" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="flex justify-end pt-4">
							<Button type="submit" disabled={saving}>
								{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Save changes
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}

function HoursTab({ businessId, initialHours }: { businessId: string; initialHours: BusinessHours[] }) {
	const [saving, setSaving] = useState(false)
	const [hours, setHours] = useState<Array<{
		day_of_week: number
		open_time: string
		close_time: string
		is_closed: boolean
	}>>(() =>
		DAYS.map((_, i) => {
			const existing = initialHours.find((h) => h.day_of_week === i)
			return {
				day_of_week: i,
				open_time: existing?.open_time ?? '09:00',
				close_time: existing?.close_time ?? '17:00',
				is_closed: existing?.is_closed ?? (i === 0),
			}
		})
	)

	function updateHour(index: number, field: string, value: string | boolean) {
		setHours((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)))
	}

	function applyToWeekdays() {
		const monday = hours[1]
		if (!monday) return
		setHours((prev) =>
			prev.map((h, i) =>
				i >= 1 && i <= 5
					? { ...h, open_time: monday.open_time, close_time: monday.close_time, is_closed: monday.is_closed }
					: h
			)
		)
		toast.info('Monday hours applied to all weekdays')
	}

	async function handleSave() {
		setSaving(true)
		const result = await updateBusinessHours(businessId, hours)
		setSaving(false)
		if (result.error) {
			toast.error(result.error)
		} else {
			toast.success('Business hours updated')
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Clock className="h-5 w-5" />
							Business Hours
						</CardTitle>
						<CardDescription>Set your operating hours for each day of the week.</CardDescription>
					</div>
					<Button variant="outline" size="sm" onClick={applyToWeekdays}>
						Apply Mon to weekdays
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{hours.map((hour, index) => (
						<div
							key={hour.day_of_week}
							className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
						>
							<div className="w-28 font-medium text-sm">{DAYS[index]}</div>
							<div className="flex items-center gap-2">
								<Switch
									checked={!hour.is_closed}
									onCheckedChange={(checked) => updateHour(index, 'is_closed', !checked)}
								/>
								<span className="text-xs text-muted-foreground w-10">
									{hour.is_closed ? 'Closed' : 'Open'}
								</span>
							</div>
							{!hour.is_closed && (
								<div className="flex items-center gap-2">
									<Input
										type="time"
										value={hour.open_time}
										onChange={(e) => updateHour(index, 'open_time', e.target.value)}
										className="w-32"
									/>
									<span className="text-muted-foreground text-sm">to</span>
									<Input
										type="time"
										value={hour.close_time}
										onChange={(e) => updateHour(index, 'close_time', e.target.value)}
										className="w-32"
									/>
								</div>
							)}
						</div>
					))}
				</div>

				<div className="flex justify-end pt-6">
					<Button onClick={handleSave} disabled={saving}>
						{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save hours
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}

function SettingsTab({ business }: { business: Business }) {
	const [saving, setSaving] = useState(false)
	const [cancellationPolicy, setCancellationPolicy] = useState(business.cancellation_policy ?? '')
	const [cancellationHours, setCancellationHours] = useState(business.cancellation_hours)
	const [autoConfirm, setAutoConfirm] = useState(business.auto_confirm)
	const [bufferMinutes, setBufferMinutes] = useState(business.buffer_minutes)

	async function handleSave() {
		setSaving(true)
		const result = await updateBusinessSettings(business.id, {
			cancellation_policy: cancellationPolicy,
			cancellation_hours: cancellationHours,
			auto_confirm: autoConfirm,
			buffer_minutes: bufferMinutes,
		})
		setSaving(false)
		if (result.error) {
			toast.error(result.error)
		} else {
			toast.success('Settings updated')
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Settings className="h-5 w-5" />
					Booking Settings
				</CardTitle>
				<CardDescription>Configure how bookings work for your business.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-2">
					<label className="text-sm font-medium">Cancellation Policy</label>
					<Textarea
						value={cancellationPolicy}
						onChange={(e) => setCancellationPolicy(e.target.value)}
						placeholder="Describe your cancellation policy..."
						className="min-h-24 resize-none"
					/>
				</div>

				<div className="grid gap-6 sm:grid-cols-2">
					<div className="space-y-2">
						<label className="text-sm font-medium">Cancellation Window</label>
						<div className="flex items-center gap-2">
							<Input
								type="number"
								min={1}
								max={168}
								value={cancellationHours}
								onChange={(e) => setCancellationHours(parseInt(e.target.value) || 24)}
								className="w-24"
							/>
							<span className="text-sm text-muted-foreground">hours before appointment</span>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Buffer Time</label>
						<div className="flex items-center gap-2">
							<Input
								type="number"
								min={0}
								max={120}
								value={bufferMinutes}
								onChange={(e) => setBufferMinutes(parseInt(e.target.value) || 0)}
								className="w-24"
							/>
							<span className="text-sm text-muted-foreground">minutes between appointments</span>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-between rounded-lg border p-4">
					<div>
						<p className="text-sm font-medium">Auto-confirm bookings</p>
						<p className="text-sm text-muted-foreground">
							Automatically confirm new bookings without manual approval.
						</p>
					</div>
					<Switch checked={autoConfirm} onCheckedChange={setAutoConfirm} />
				</div>

				<div className="flex justify-end pt-4">
					<Button onClick={handleSave} disabled={saving}>
						{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save settings
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
