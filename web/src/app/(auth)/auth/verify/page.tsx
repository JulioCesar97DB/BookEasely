'use client'

import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function VerifyPage() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
			className="space-y-6"
		>
			<div className="flex flex-col items-center gap-4 text-center">
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
					className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
				>
					<Mail className="h-8 w-8 text-primary" />
				</motion.div>

				<div className="space-y-2">
					<h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
					<p className="text-sm text-muted-foreground leading-relaxed">
						We&apos;ve sent you a verification link. Please check your inbox and click the link to verify your account.
					</p>
				</div>
			</div>

			<div className="rounded-xl border bg-muted/30 p-4">
				<p className="text-center text-xs text-muted-foreground">
					Didn&apos;t receive the email? Check your spam folder or try signing up again with a different email address.
				</p>
			</div>

			<Button asChild variant="outline" className="w-full">
				<Link href="/auth/login">Back to login</Link>
			</Button>
		</motion.div>
	)
}
