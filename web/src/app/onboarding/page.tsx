'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CalendarCheck, Loader2, MapPin, Phone, Store, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function OnboardingPage() {
	const router = useRouter()
	const supabase = createClient()

	const [step, setStep] = useState(0)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Profile fields
	const [fullName, setFullName] = useState('')
	const [phone, setPhone] = useState('')

	// Business fields (only for business_owner)
	const [role, setRole] = useState<string | null>(null)
	const [businessName, setBusinessName] = useState('')
	const [businessAddress, setBusinessAddress] = useState('')
	const [businessCity, setBusinessCity] = useState('')
	const [businessState, setBusinessState] = useState('')
	const [businessZip, setBusinessZip] = useState('')

	async function loadCurrentProfile() {
		const { data: { user } } = await supabase.auth.getUser()
		if (!user) return
		const { data: profile } = await supabase
			.from('profiles')
			.select('full_name, phone, role')
			.eq('id', user.id)
			.single()
		if (profile) {
			setFullName(profile.full_name || '')
			setPhone(profile.phone || '')
			setRole(profile.role)
		}
	}

	// Load profile on mount
	useState(() => {
		loadCurrentProfile()
	})

	async function handleCompleteProfile() {
		setIsLoading(true)
		setError(null)

		const { data: { user } } = await supabase.auth.getUser()
		if (!user) return

		// Update profile
		const { error: profileError } = await supabase
			.from('profiles')
			.update({
				full_name: fullName,
				phone,
				onboarding_completed: role === 'client',
			})
			.eq('id', user.id)

		if (profileError) {
			setError(profileError.message)
			setIsLoading(false)
			return
		}

		if (role === 'business_owner') {
			setStep(1)
			setIsLoading(false)
		} else {
			router.push('/dashboard')
		}
	}

	async function handleCompleteBusiness() {
		setIsLoading(true)
		setError(null)

		const { data: { user } } = await supabase.auth.getUser()
		if (!user) return

		// Create business
		const slug = businessName
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '')
			+ '-' + Date.now().toString(36)

		const { error: bizError } = await supabase
			.from('businesses')
			.insert({
				owner_id: user.id,
				name: businessName,
				slug,
				address: businessAddress,
				city: businessCity,
				state: businessState,
				zip_code: businessZip,
				phone,
			})

		if (bizError) {
			setError(bizError.message)
			setIsLoading(false)
			return
		}

		// Mark onboarding complete
		await supabase
			.from('profiles')
			.update({ onboarding_completed: true })
			.eq('id', user.id)

		router.push('/dashboard')
	}

	return (
		<div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-background via-background to-brand-muted/20 p-4">
			<div className="w-full max-w-lg">
				{/* Logo */}
				<div className="mb-8 flex items-center justify-center gap-2.5">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
						<CalendarCheck className="h-5 w-5 text-primary-foreground" />
					</div>
					<span className="text-xl font-semibold tracking-tight">BookEasely</span>
				</div>

				<AnimatePresence mode="wait">
					{step === 0 ? (
						<motion.div
							key="step-0"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							transition={{ duration: 0.3 }}
						>
							<Card>
								<CardContent className="pt-6 space-y-6">
									<div className="text-center space-y-2">
										<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
											<User className="h-6 w-6 text-primary" />
										</div>
										<h1 className="text-2xl font-bold tracking-tight">Complete your profile</h1>
										<p className="text-sm text-muted-foreground">
											Tell us a bit about yourself to get started
										</p>
									</div>

									{error && (
										<div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
											{error}
										</div>
									)}

									<div className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="full_name">Full name</Label>
											<Input
												id="full_name"
												value={fullName}
												onChange={(e) => setFullName(e.target.value)}
												placeholder="John Doe"
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="phone">Phone number</Label>
											<div className="relative">
												<Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
												<Input
													id="phone"
													value={phone}
													onChange={(e) => setPhone(e.target.value)}
													placeholder="+1 (555) 000-0000"
													className="pl-10"
												/>
											</div>
										</div>
									</div>

									<Button
										className="w-full"
										onClick={handleCompleteProfile}
										disabled={isLoading || !fullName.trim() || !phone.trim()}
									>
										{isLoading ? (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										) : (
											<ArrowRight className="mr-2 h-4 w-4" />
										)}
										Continue
									</Button>
								</CardContent>
							</Card>
						</motion.div>
					) : (
						<motion.div
							key="step-1"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.3 }}
						>
							<Card>
								<CardContent className="pt-6 space-y-6">
									<div className="text-center space-y-2">
										<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
											<Store className="h-6 w-6 text-primary" />
										</div>
										<h1 className="text-2xl font-bold tracking-tight">Set up your business</h1>
										<p className="text-sm text-muted-foreground">
											Add your business details to start receiving bookings
										</p>
									</div>

									{error && (
										<div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
											{error}
										</div>
									)}

									<div className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="business_name">Business name</Label>
											<Input
												id="business_name"
												value={businessName}
												onChange={(e) => setBusinessName(e.target.value)}
												placeholder="My Business"
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="address">Address</Label>
											<div className="relative">
												<MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
												<Input
													id="address"
													value={businessAddress}
													onChange={(e) => setBusinessAddress(e.target.value)}
													placeholder="123 Main St"
													className="pl-10"
												/>
											</div>
										</div>

										<div className="grid grid-cols-3 gap-3">
											<div className="space-y-2">
												<Label htmlFor="city">City</Label>
												<Input
													id="city"
													value={businessCity}
													onChange={(e) => setBusinessCity(e.target.value)}
													placeholder="City"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="state">State</Label>
												<Input
													id="state"
													value={businessState}
													onChange={(e) => setBusinessState(e.target.value)}
													placeholder="CA"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="zip">ZIP</Label>
												<Input
													id="zip"
													value={businessZip}
													onChange={(e) => setBusinessZip(e.target.value)}
													placeholder="90210"
												/>
											</div>
										</div>
									</div>

									<div className="flex gap-3">
										<Button
											variant="outline"
											className="flex-1"
											onClick={() => { setStep(0); setError(null) }}
										>
											Back
										</Button>
										<Button
											className="flex-1"
											onClick={handleCompleteBusiness}
											disabled={isLoading || !businessName.trim()}
										>
											{isLoading ? (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											) : (
												<ArrowRight className="mr-2 h-4 w-4" />
											)}
											Finish setup
										</Button>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Step indicator */}
				{role === 'business_owner' && (
					<div className="mt-6 flex justify-center gap-2">
						{[0, 1].map((s) => (
							<div
								key={s}
								className={`h-1.5 rounded-full transition-all ${s === step ? 'w-8 bg-primary' : 'w-1.5 bg-border'
									}`}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
