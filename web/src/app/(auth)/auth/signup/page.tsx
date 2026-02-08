'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Briefcase, Loader2, User } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUpSchema, type SignUpInput } from '@/lib/validations/auth'
import { signUp } from '../../actions'

export default function SignUpPage() {
	const [serverError, setServerError] = useState<string | null>(null)
	const [selectedRole, setSelectedRole] = useState<'client' | 'business_owner'>('client')

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<SignUpInput>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			role: 'client',
		},
	})

	function handleRoleChange(role: 'client' | 'business_owner') {
		setSelectedRole(role)
		setValue('role', role)
	}

	async function onSubmit(data: SignUpInput) {
		setServerError(null)
		const formData = new FormData()
		formData.append('full_name', data.full_name)
		formData.append('email', data.email)
		formData.append('phone', data.phone)
		formData.append('password', data.password)
		formData.append('role', data.role)
		const result = await signUp(formData)
		if (result?.error) {
			setServerError(result.error)
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
				<input type="hidden" {...register('role')} />
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="full_name">Full name</Label>
					<Input
						id="full_name"
						placeholder="John Doe"
						autoComplete="name"
						{...register('full_name')}
					/>
					{errors.full_name && (
						<p className="text-xs text-destructive">{errors.full_name.message}</p>
					)}
				</div>

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
					<Label htmlFor="phone">Phone number</Label>
					<Input
						id="phone"
						type="tel"
						placeholder="+1 (555) 000-0000"
						autoComplete="tel"
						{...register('phone')}
					/>
					{errors.phone && (
						<p className="text-xs text-destructive">{errors.phone.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						type="password"
						placeholder="At least 8 characters"
						autoComplete="new-password"
						{...register('password')}
					/>
					{errors.password && (
						<p className="text-xs text-destructive">{errors.password.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="confirm_password">Confirm password</Label>
					<Input
						id="confirm_password"
						type="password"
						placeholder="Re-enter your password"
						autoComplete="new-password"
						{...register('confirm_password')}
					/>
					{errors.confirm_password && (
						<p className="text-xs text-destructive">{errors.confirm_password.message}</p>
					)}
				</div>

				<Button type="submit" className="w-full" disabled={isSubmitting}>
					{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Create account
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
	)
}
