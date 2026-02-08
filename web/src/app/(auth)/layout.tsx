import { CalendarCheck } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			{/* Left - Form */}
			<div className="flex flex-col">
				<div className="flex items-center gap-2 p-6 md:p-8">
					<Link href="/" className="flex items-center gap-2.5 font-semibold text-foreground">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
							<CalendarCheck className="h-4.5 w-4.5 text-primary-foreground" />
						</div>
						<span className="text-lg tracking-tight">BookEasely</span>
					</Link>
				</div>
				<div className="flex flex-1 items-center justify-center px-6 pb-12 md:px-8">
					<div className="w-full max-w-sm">{children}</div>
				</div>
			</div>

			{/* Right - Visual */}
			<div className="relative hidden overflow-hidden bg-primary lg:block">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.65_0.22_255)_0%,oklch(0.45_0.18_260)_50%,oklch(0.30_0.15_270)_100%)]" />
				<div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

				<div className="relative flex h-full flex-col items-center justify-center px-12 text-white">
					<div className="max-w-md space-y-8">
						<div className="space-y-4">
							<h2 className="text-4xl font-bold leading-tight tracking-tight">
								Manage your bookings with ease
							</h2>
							<p className="text-lg leading-relaxed text-white/75">
								Connect with clients, manage schedules, and grow your business — all in one place.
							</p>
						</div>

						<div className="space-y-4 pt-4">
							{[
								{ label: 'Easy scheduling', desc: 'Clients book in seconds' },
								{ label: 'Worker management', desc: 'Each staff member gets their own schedule' },
								{ label: 'Real-time updates', desc: 'Instant notifications for new bookings' },
							].map((feature) => (
								<div key={feature.label} className="flex items-start gap-3">
									<div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
										<svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
										</svg>
									</div>
									<div>
										<p className="font-medium">{feature.label}</p>
										<p className="text-sm text-white/60">{feature.desc}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
