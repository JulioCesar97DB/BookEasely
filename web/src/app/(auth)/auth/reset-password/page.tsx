'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth'
import { resetPassword } from '../../actions'

export default function ResetPasswordPage() {
	const [serverError, setServerError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ResetPasswordInput>({
		resolver: zodResolver(resetPasswordSchema),
	})

	async function onSubmit(data: ResetPasswordInput) {
		setServerError(null)
		setSuccess(null)
		const formData = new FormData()
		formData.append('email', data.email)
		const result = await resetPassword(formData)
		if (result?.error) {
			setServerError(result.error)
		}
		if (result?.success) {
			setSuccess(result.success)
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
			className="space-y-6"
		>
			<Link
				href="/auth/login"
				className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
			>
				<ArrowLeft className="h-4 w-4" />
				Back to login
			</Link>

			<div className="space-y-2">
				<h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
				<p className="text-sm text-muted-foreground">
					Enter your email and we&apos;ll send you a link to reset your password
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

			{success ? (
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className="space-y-4"
				>
					<div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<Mail className="h-6 w-6 text-primary" />
						</div>
						<div className="space-y-1">
							<p className="font-medium">Check your email</p>
							<p className="text-sm text-muted-foreground">{success}</p>
						</div>
					</div>
					<Button asChild variant="outline" className="w-full">
						<Link href="/auth/login">Back to login</Link>
					</Button>
				</motion.div>
			) : (
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

					<Button type="submit" className="w-full" disabled={isSubmitting}>
						{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Send reset link
					</Button>
				</form>
			)}
		</motion.div>
	)
}
