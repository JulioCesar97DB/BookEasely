'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Briefcase, Loader2, Phone, ShieldCheck, User } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUpSchema, otpVerifySchema, type SignUpInput, type OtpVerifyInput } from '@/lib/validations/auth'
import { sendOtp, verifyOtp } from '../../actions'

export default function SignUpPage() {
	const [serverError, setServerError] = useState<string | null>(null)
	const [selectedRole, setSelectedRole] = useState<'client' | 'business_owner'>('client')
	const [step, setStep] = useState<'info' | 'otp'>('info')
	const [phone, setPhone] = useState('')
	const [countdown, setCountdown] = useState(0)
	const otpInputRef = useRef<HTMLInputElement>(null)

	const infoForm = useForm<SignUpInput>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			role: 'client',
		},
	})

	const otpForm = useForm<OtpVerifyInput>({
		resolver: zodResolver(otpVerifySchema),
	})

	function handleRoleChange(role: 'client' | 'business_owner') {
		setSelectedRole(role)
		infoForm.setValue('role', role)
	}

	useEffect(() => {
		if (countdown <= 0) return
		const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
		return () => clearTimeout(timer)
	}, [countdown])

	useEffect(() => {
		if (step === 'otp') {
			otpInputRef.current?.focus()
		}
	}, [step])

	async function onSendCode(data: SignUpInput) {
		setServerError(null)
		const result = await sendOtp(data.phone, {
			full_name: data.full_name,
			role: data.role,
		})
		if (result?.error) {
			setServerError(result.error)
			return
		}
		setPhone(data.phone)
		setStep('otp')
		setCountdown(60)
	}

	async function onVerifyCode(data: OtpVerifyInput) {
		setServerError(null)
		const result = await verifyOtp(phone, data.token)
		if (result?.error) {
			setServerError(result.error)
		}
	}

	const handleResend = useCallback(async () => {
		if (countdown > 0) return
		setServerError(null)
		const values = infoForm.getValues()
		const result = await sendOtp(phone, {
			full_name: values.full_name,
			role: values.role,
		})
		if (result?.error) {
			setServerError(result.error)
			return
		}
		setCountdown(60)
	}, [countdown, phone, infoForm])

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
			className="space-y-6"
		>
			<AnimatePresence mode="wait">
				{step === 'info' ? (
					<motion.div
						key="info-step"
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.3 }}
						className="space-y-6"
					>
						<div className="space-y-2">
							<h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
							<p className="text-sm text-muted-foreground">
								Get started with BookEasely today
							</p>
						</div>

						{serverError && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
							>
								{serverError}
							</motion.div>
						)}

						{/* Role selector */}
						<div className="space-y-2">
							<Label>I want to</Label>
							<div className="grid grid-cols-2 gap-3">
								<button
									type="button"
									onClick={() => handleRoleChange('client')}
									className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${selectedRole === 'client'
											? 'border-primary bg-primary/5 shadow-sm'
											: 'border-border hover:border-primary/30 hover:bg-accent/50'
										}`}
								>
									<User className={`h-5 w-5 ${selectedRole === 'client' ? 'text-primary' : 'text-muted-foreground'}`} />
									<span className={`text-sm font-medium ${selectedRole === 'client' ? 'text-primary' : 'text-foreground'}`}>
										Book services
									</span>
								</button>
								<button
									type="button"
									onClick={() => handleRoleChange('business_owner')}
									className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${selectedRole === 'business_owner'
											? 'border-primary bg-primary/5 shadow-sm'
											: 'border-border hover:border-primary/30 hover:bg-accent/50'
										}`}
								>
									<Briefcase className={`h-5 w-5 ${selectedRole === 'business_owner' ? 'text-primary' : 'text-muted-foreground'}`} />
									<span className={`text-sm font-medium ${selectedRole === 'business_owner' ? 'text-primary' : 'text-foreground'}`}>
										List my business
									</span>
								</button>
							</div>
							<input type="hidden" {...infoForm.register('role')} />
						</div>

						<form onSubmit={infoForm.handleSubmit(onSendCode)} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="full_name">Full name</Label>
								<Input
									id="full_name"
									placeholder="John Doe"
									autoComplete="name"
									{...infoForm.register('full_name')}
								/>
								{infoForm.formState.errors.full_name && (
									<p className="text-xs text-destructive">{infoForm.formState.errors.full_name.message}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="phone">Phone number</Label>
								<div className="relative">
									<Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										id="phone"
										type="tel"
										placeholder="+1 (555) 000-0000"
										autoComplete="tel"
										className="pl-10"
										{...infoForm.register('phone')}
									/>
								</div>
								{infoForm.formState.errors.phone && (
									<p className="text-xs text-destructive">{infoForm.formState.errors.phone.message}</p>
								)}
							</div>

							<Button type="submit" className="w-full" disabled={infoForm.formState.isSubmitting}>
								{infoForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Send Code
							</Button>
						</form>

						<p className="text-center text-sm text-muted-foreground">
							Already have an account?{' '}
							<Link
								href="/auth/login"
								className="font-medium text-primary hover:text-primary/80 transition-colors"
							>
								Sign in
							</Link>
						</p>

						<p className="text-center text-xs text-muted-foreground/70">
							By creating an account, you agree to our{' '}
							<Link href="/terms" className="underline hover:text-muted-foreground">Terms of Service</Link>
							{' '}and{' '}
							<Link href="/privacy" className="underline hover:text-muted-foreground">Privacy Policy</Link>
						</p>
					</motion.div>
				) : (
					<motion.div
						key="otp-step"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 20 }}
						transition={{ duration: 0.3 }}
						className="space-y-6"
					>
						<button
							type="button"
							onClick={() => { setStep('info'); setServerError(null) }}
							className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							<ArrowLeft className="h-4 w-4" />
							Back
						</button>

						<div className="flex flex-col items-center gap-4 text-center">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
								className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10"
							>
								<ShieldCheck className="h-7 w-7 text-primary" />
							</motion.div>
							<div className="space-y-1">
								<h1 className="text-2xl font-bold tracking-tight">Verify your phone</h1>
								<p className="text-sm text-muted-foreground">
									We sent a 6-digit code to <span className="font-medium text-foreground">{phone}</span>
								</p>
							</div>
						</div>

						{serverError && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
							>
								{serverError}
							</motion.div>
						)}

						<form onSubmit={otpForm.handleSubmit(onVerifyCode)} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="token">Verification code</Label>
								<Input
									id="token"
									type="text"
									inputMode="numeric"
									maxLength={6}
									placeholder="000000"
									autoComplete="one-time-code"
									className="text-center text-2xl tracking-[0.5em] font-mono"
									{...otpForm.register('token')}
									ref={(e) => {
										otpForm.register('token').ref(e)
										otpInputRef.current = e
									}}
								/>
								{otpForm.formState.errors.token && (
									<p className="text-xs text-destructive">{otpForm.formState.errors.token.message}</p>
								)}
							</div>

							<Button type="submit" className="w-full" disabled={otpForm.formState.isSubmitting}>
								{otpForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Verify & Create Account
							</Button>
						</form>

						<p className="text-center text-sm text-muted-foreground">
							{countdown > 0 ? (
								<>Resend code in <span className="font-medium text-foreground">{countdown}s</span></>
							) : (
								<button
									type="button"
									onClick={handleResend}
									className="font-medium text-primary hover:text-primary/80 transition-colors"
								>
									Resend code
								</button>
							)}
						</p>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	)
}
