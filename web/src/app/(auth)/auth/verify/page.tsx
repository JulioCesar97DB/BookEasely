'use client'

import { motion } from 'framer-motion'
import { Phone } from 'lucide-react'
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
					<Phone className="h-8 w-8 text-primary" />
				</motion.div>

				<div className="space-y-2">
					<h1 className="text-2xl font-bold tracking-tight">Verification sent</h1>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Please go back to the login or signup page to enter your verification code.
					</p>
				</div>
			</div>

			<Button asChild variant="outline" className="w-full">
				<Link href="/auth/login">Go to login</Link>
			</Button>
		</motion.div>
	)
}
