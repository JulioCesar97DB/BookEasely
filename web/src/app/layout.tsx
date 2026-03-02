import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
	title: 'BookEasely — Book appointments with ease',
	description:
		'Discover local businesses, browse services, and book appointments in seconds.',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className="font-sans antialiased"
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
					<Toaster position="top-center" richColors />
				</ThemeProvider>
			</body>
		</html>
	)
}
