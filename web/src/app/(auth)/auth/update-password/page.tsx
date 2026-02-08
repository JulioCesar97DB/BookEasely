'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Loader2, Lock } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePasswordSchema, type UpdatePasswordInput } from '@/lib/validations/auth'
import { updatePassword } from '../../actions'

export default function UpdatePasswordPage() {
	const [serverError, setServerError] = useState<string | null>(null)

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<UpdatePasswordInput>({
		resolver: zodResolver(updatePasswordSchema),
	})

	async function onSubmit(data: UpdatePasswordInput) {
		setServerError(null)
		const formData = new FormData()
		formData.append('password', data.password)
		const result = await updatePassword(formData)
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
				<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
					<Lock className="h-6 w-6 text-primary" />
				</div>
				<h1 className="text-2xl font-bold tracking-tight">Set new password</h1>
				<p className="text-sm text-muted-foreground">
					Enter a new password for your account
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
					<Label htmlFor="password">New password</Label>
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
					<Label htmlFor="confirm_password">Confirm new password</Label>
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
					Update password
				</Button>
			</form>
		</motion.div>
	)
}
