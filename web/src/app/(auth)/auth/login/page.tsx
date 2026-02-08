'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInSchema, type SignInInput } from '@/lib/validations/auth'
import { signIn, signInWithGoogle } from '../../actions'

function LoginForm() {
	const searchParams = useSearchParams()
	const redirectError = searchParams.get('error')
	const [serverError, setServerError] = useState<string | null>(redirectError)
	const [isGoogleLoading, setIsGoogleLoading] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<SignInInput>({
		resolver: zodResolver(signInSchema),
	})

	async function onSubmit(data: SignInInput) {
		setServerError(null)
		const formData = new FormData()
		formData.append('email', data.email)
		formData.append('password', data.password)
		const result = await signIn(formData)
		if (result?.error) {
			setServerError(result.error)
		}
	}

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
			<div className="space-y-2">
				<h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
				<p className="text-sm text-muted-foreground">
					Sign in to your account to continue
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

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="you@example.com"
						autoComplete="email"
						{...register('email')}
					/>
					{errors.email && (
						<p className="text-xs text-destructive">{errors.email.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor="password">Password</Label>
						<Link
							href="/auth/reset-password"
							className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
						>
							Forgot password?
						</Link>
					</div>
					<Input
						id="password"
						type="password"
						placeholder="Enter your password"
						autoComplete="current-password"
						{...register('password')}
					/>
					{errors.password && (
						<p className="text-xs text-destructive">{errors.password.message}</p>
					)}
				</div>

				<Button type="submit" className="w-full" disabled={isSubmitting}>
					{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Sign In
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
					<div className="h-10 animate-pulse rounded bg-muted" />
				</div>
			</div>
		}>
			<LoginForm />
		</Suspense>
	)
}
