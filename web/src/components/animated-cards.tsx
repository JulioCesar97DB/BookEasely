'use client'

import { motion } from 'framer-motion';

export function AnimatedCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay, duration: 0.25, ease: 'easeOut' }}
		>
			{children}
		</motion.div>
	)
}

export function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay, duration: 0.3 }}
		>
			{children}
		</motion.div>
	)
}
