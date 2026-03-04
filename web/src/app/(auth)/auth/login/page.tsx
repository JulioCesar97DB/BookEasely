'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2, Phone, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInSchema, otpVerifySchema, type SignInInput, type OtpVerifyInput } from '@/lib/validations/auth'
import { sendOtp, verifyOtp, signInWithGoogle } from '../../actions'

function LoginForm() {
	const searchParams = useSearchParams()
	const redirectError = searchParams.get('error')
	const [serverError, setServerError] = useState<string | null>(redirectError)
	const [isGoogleLoading, setIsGoogleLoading] = useState(false)
	const [step, setStep] = useState<'phone' | 'otp'>('phone')
	const [phone, setPhone] = useState('')
	const [countdown, setCountdown] = useState(0)
	const otpInputRef = useRef<HTMLInputElement>(null)

	const phoneForm = useForm<SignInInput>({
		resolver: zodResolver(signInSchema),
	})

	const otpForm = useForm<OtpVerifyInput>({
		resolver: zodResolver(otpVerifySchema),
	})

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

	async function onSendCode(data: SignInInput) {
		setServerError(null)
		const result = await sendOtp(data.phone)
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
		const result = await sendOtp(phone)
		if (result?.error) {
			setServerError(result.error)
			return
		}
		setCountdown(60)
	}, [countdown, phone])

	async function handleGoogleSignIn() {
		setIsGoogleLoading(true)
		setServerError(null)
		const result = await signInWithGoogle()
		if (result?.error) {
			setServerError(result.error)
			setIsGoogleLoading(false)
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
			className="space-y-6"
		>
			<AnimatePresence mode="wait">
				{step === 'phone' ? (
					<motion.div
						key="phone-step"
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.3 }}
						className="space-y-6"
					>
						<div className="space-y-2">
							<h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
							<p className="text-sm text-muted-foreground">
								Enter your phone number to sign in
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

						<form onSubmit={phoneForm.handleSubmit(onSendCode)} className="space-y-4">
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
										{...phoneForm.register('phone')}
									/>
								</div>
								{phoneForm.formState.errors.phone && (
									<p className="text-xs text-destructive">{phoneForm.formState.errors.phone.message}</p>
								)}
							</div>

							<Button type="submit" className="w-full" disabled={phoneForm.formState.isSubmitting}>
								{phoneForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Send Code
							</Button>
						</form>

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">
									Or continue with
								</span>
							</div>
						</div>

						<Button
							variant="outline"
							className="w-full"
							onClick={handleGoogleSignIn}
							disabled={isGoogleLoading}
						>
							{isGoogleLoading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
									<path
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
										fill="#4285F4"
									/>
									<path
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										fill="#34A853"
									/>
									<path
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										fill="#FBBC05"
									/>
									<path
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										fill="#EA4335"
									/>
								</svg>
							)}
							Continue with Google
						</Button>

						<p className="text-center text-sm text-muted-foreground">
							Don&apos;t have an account?{' '}
							<Link
								href="/auth/signup"
								className="font-medium text-primary hover:text-primary/80 transition-colors"
							>
								Sign up
							</Link>
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
							onClick={() => { setStep('phone'); setServerError(null) }}
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
								<h1 className="text-2xl font-bold tracking-tight">Enter verification code</h1>
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
								Verify & Sign In
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

export default function LoginPage() {
	return (
		<Suspense fallback={
			<div className="space-y-6">
				<div className="space-y-2">
					<div className="h-8 w-48 animate-pulse rounded bg-muted" />
					<div className="h-4 w-64 animate-pulse rounded bg-muted" />
				</div>
				<div className="space-y-4">
					<div className="h-10 animate-pulse rounded bg-muted" />
					<div className="h-10 animate-pulse rounded bg-muted" />
				</div>
			</div>
		}>
			<LoginForm />
		</Suspense>
	)
}
