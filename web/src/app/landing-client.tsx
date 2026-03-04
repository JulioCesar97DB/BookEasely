'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BusinessCard } from '@/components/business-card'
import {
	ArrowRight,
	Calendar,
	Camera,
	CheckCircle2,
	Clock,
	Dog,
	Dumbbell,
	GraduationCap,
	Heart,
	MapPin,
	Scissors,
	Search,
	Star,
	Stethoscope,
	Users,
	Wrench,
	Zap,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { BusinessWithCategory } from '@/lib/types'

gsap.registerPlugin(ScrollTrigger)

interface LandingClientProps {
	featuredBusinesses: BusinessWithCategory[]
}

const categories = [
	{ name: 'Barbershop', slug: 'barbershop', icon: Scissors, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' },
	{ name: 'Fitness', slug: 'fitness-training', icon: Dumbbell, color: 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400' },
	{ name: 'Spa & Massage', slug: 'spa-massage', icon: Heart, color: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400' },
	{ name: 'Medical', slug: 'medical-dental', icon: Stethoscope, color: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' },
	{ name: 'Photography', slug: 'photography', icon: Camera, color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400' },
	{ name: 'Pet Services', slug: 'pet-services', icon: Dog, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' },
	{ name: 'Auto Services', slug: 'auto-services', icon: Wrench, color: 'bg-slate-50 text-slate-600 dark:bg-slate-950/40 dark:text-slate-400' },
	{ name: 'Tutoring', slug: 'tutoring-education', icon: GraduationCap, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' },
]

const steps = [
	{
		number: '01',
		title: 'Search',
		description: 'Find local businesses and services that match what you need.',
		icon: Search,
	},
	{
		number: '02',
		title: 'Choose',
		description: 'Pick a service, select your preferred worker and time slot.',
		icon: Calendar,
	},
	{
		number: '03',
		title: 'Book',
		description: 'Confirm your appointment instantly. No calls, no hassle.',
		icon: CheckCircle2,
	},
]

const valueProps = [
	{ title: 'Book 24/7', description: 'Your clients can book appointments anytime, even outside business hours.', icon: Clock },
	{ title: 'No Calls Needed', description: 'Skip the phone tag. Clients browse, pick, and confirm — all online.', icon: Zap },
	{ title: 'Instant Confirmation', description: 'Bookings are confirmed immediately. No waiting, no back-and-forth.', icon: CheckCircle2 },
	{ title: 'Free to Start', description: 'List your business and start accepting bookings at no cost.', icon: Star },
]

const whyFeatures = [
	{
		title: 'For Business Owners',
		items: [
			'Manage services, workers, and schedules from one dashboard',
			'See all bookings in a beautiful calendar view',
			'Get notified instantly when clients book or cancel',
			'Collect reviews and build your reputation',
		],
		icon: Users,
		color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
	},
	{
		title: 'For Clients',
		items: [
			'Discover local businesses by category or search',
			'Browse services, prices, and worker availability',
			'Book in under 30 seconds — no account needed to explore',
			'Manage and reschedule appointments from your phone',
		],
		icon: Heart,
		color: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400',
	},
]

export function LandingClient({ featuredBusinesses }: LandingClientProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const heroRef = useRef<HTMLDivElement>(null)
	const categoriesRef = useRef<HTMLDivElement>(null)
	const howItWorksRef = useRef<HTMLDivElement>(null)
	const statsRef = useRef<HTMLDivElement>(null)
	const testimonialsRef = useRef<HTMLDivElement>(null)
	const ctaRef = useRef<HTMLDivElement>(null)
	const featuredRef = useRef<HTMLDivElement>(null)

	useGSAP(() => {
		const mm = gsap.matchMedia()

		mm.add('(min-width: 1px)', () => {
			// ── Hero entrance timeline ──
			const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
			heroTl
				.from('[data-hero-badge]', { opacity: 0, y: 20, duration: 0.5 })
				.from('[data-hero-title] .word', { opacity: 0, y: 40, rotateX: 40, duration: 0.6, stagger: 0.08 }, '-=0.2')
				.from('[data-hero-subtitle]', { opacity: 0, y: 20, duration: 0.5 }, '-=0.3')
				.from('[data-hero-search]', { opacity: 0, y: 20, duration: 0.5 }, '-=0.2')
				.from('[data-hero-trust] > *', { opacity: 0, y: 15, duration: 0.4, stagger: 0.1 }, '-=0.2')

			// Hero image parallax on scroll
			gsap.to('[data-hero-image]', {
				y: -60,
				ease: 'none',
				scrollTrigger: {
					trigger: heroRef.current,
					start: 'top top',
					end: 'bottom top',
					scrub: 1,
				},
			})

			// Hero background blobs drift on scroll
			gsap.to('[data-hero-blob-1]', {
				y: -100,
				x: 30,
				scale: 1.15,
				ease: 'none',
				scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1.5 },
			})
			gsap.to('[data-hero-blob-2]', {
				y: -80,
				x: -20,
				scale: 0.9,
				ease: 'none',
				scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1.5 },
			})

			// ── Section heading reveals (scroll-triggered text clip) ──
			gsap.utils.toArray<HTMLElement>('[data-section-heading]').forEach((heading) => {
				gsap.from(heading, {
					opacity: 0,
					y: 30,
					duration: 0.7,
					ease: 'power3.out',
					scrollTrigger: {
						trigger: heading,
						start: 'top 85%',
						toggleActions: 'play none none none',
					},
				})
			})
			gsap.utils.toArray<HTMLElement>('[data-section-sub]').forEach((sub) => {
				gsap.from(sub, {
					opacity: 0,
					y: 20,
					duration: 0.5,
					delay: 0.15,
					ease: 'power2.out',
					scrollTrigger: {
						trigger: sub,
						start: 'top 85%',
						toggleActions: 'play none none none',
					},
				})
			})

			// ── Categories stagger with rotation ──
			gsap.from('[data-category-card]', {
				opacity: 0,
				y: 50,
				scale: 0.9,
				rotateY: 15,
				duration: 0.5,
				stagger: 0.06,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: categoriesRef.current,
					start: 'top 80%',
					toggleActions: 'play none none none',
				},
			})

			// ── How it works: step icons scale up ──
			gsap.from('[data-step-card]', {
				opacity: 0,
				y: 50,
				duration: 0.6,
				stagger: 0.15,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: howItWorksRef.current,
					start: 'top 75%',
					toggleActions: 'play none none none',
				},
			})
			// Step icon boxes: scale + rotate reveal
			gsap.from('[data-step-icon]', {
				scale: 0,
				rotate: -180,
				duration: 0.6,
				stagger: 0.18,
				ease: 'back.out(1.7)',
				scrollTrigger: {
					trigger: howItWorksRef.current,
					start: 'top 75%',
					toggleActions: 'play none none none',
				},
			})

			// Connector line animation
			gsap.from('[data-connector]', {
				scaleX: 0,
				transformOrigin: 'left center',
				duration: 0.8,
				stagger: 0.3,
				ease: 'power2.inOut',
				scrollTrigger: {
					trigger: howItWorksRef.current,
					start: 'top 70%',
					toggleActions: 'play none none none',
				},
			})

			// ── Featured businesses: stagger from bottom with slight x offset ──
			gsap.from('[data-business-card]', {
				opacity: 0,
				y: 50,
				x: (i) => (i % 2 === 0 ? -20 : 20),
				duration: 0.5,
				stagger: 0.08,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: featuredRef.current,
					start: 'top 80%',
					toggleActions: 'play none none none',
				},
			})

			// ── Value props: icon bounce + card rise ──
			gsap.from('[data-stat-card]', {
				opacity: 0,
				y: 40,
				scale: 0.95,
				duration: 0.5,
				stagger: 0.1,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: statsRef.current,
					start: 'top 80%',
					toggleActions: 'play none none none',
				},
			})
			gsap.from('[data-stat-icon]', {
				scale: 0,
				rotate: -90,
				duration: 0.5,
				stagger: 0.12,
				delay: 0.2,
				ease: 'back.out(2)',
				scrollTrigger: {
					trigger: statsRef.current,
					start: 'top 80%',
					toggleActions: 'play none none none',
				},
			})

			// ── Why BookEasely: cards slide from sides ──
			gsap.utils.toArray<HTMLElement>('[data-feature-card]').forEach((card, i) => {
				gsap.from(card, {
					opacity: 0,
					x: i === 0 ? -60 : 60,
					duration: 0.7,
					ease: 'power3.out',
					scrollTrigger: {
						trigger: card,
						start: 'top 85%',
						toggleActions: 'play none none none',
					},
				})
			})
			// Checklist items stagger in
			gsap.from('[data-check-item]', {
				opacity: 0,
				x: -15,
				duration: 0.35,
				stagger: 0.06,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: testimonialsRef.current,
					start: 'top 70%',
					toggleActions: 'play none none none',
				},
			})

			// ── CTA: scale-in with parallax bg ──
			gsap.from('[data-cta-box]', {
				scale: 0.92,
				borderRadius: '3rem',
				duration: 0.8,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: ctaRef.current,
					start: 'top 85%',
					toggleActions: 'play none none none',
				},
			})
			gsap.from('[data-cta-content] > *', {
				opacity: 0,
				y: 30,
				duration: 0.5,
				stagger: 0.1,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: ctaRef.current,
					start: 'top 75%',
					toggleActions: 'play none none none',
				},
			})

			// ── Footer: stagger columns ──
			gsap.from('[data-footer-col]', {
				opacity: 0,
				y: 25,
				duration: 0.4,
				stagger: 0.08,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: '[data-footer]',
					start: 'top 90%',
					toggleActions: 'play none none none',
				},
			})
		})
	}, { scope: containerRef })

	return (
		<div ref={containerRef}>
			{/* ═══════════════════ HERO ═══════════════════ */}
			<section ref={heroRef} className="relative overflow-hidden">
				{/* Background gradients */}
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.85_0.08_255/0.15),transparent)]" />
				<div data-hero-blob-1 className="absolute top-20 right-[-10%] h-[500px] w-[500px] rounded-full bg-primary/[0.04] blur-3xl" />
				<div data-hero-blob-2 className="absolute bottom-0 left-[-5%] h-[400px] w-[400px] rounded-full bg-brand-muted/20 blur-3xl" />

				<div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32 lg:px-8 lg:pt-32 lg:pb-36">
					<div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
						{/* Left: Text content */}
						<div>
							{/* Trust badge */}
							<div data-hero-badge className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm backdrop-blur-sm">
								<span className="flex h-2 w-2 rounded-full bg-green-500">
									<span className="h-2 w-2 animate-ping rounded-full bg-green-500 opacity-75" />
								</span>
								<span className="text-muted-foreground">Free for businesses to get started</span>
							</div>

							{/* Headline */}
							<h1 data-hero-title className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
								<span className="word inline-block mr-[0.25em]">The</span>
								<span className="word inline-block mr-[0.25em]">easiest</span>
								<span className="word inline-block mr-[0.25em]">way</span>
								<span className="word inline-block">to</span>
								<br className="hidden sm:block" />
								<span className="word inline-block mr-[0.25em] text-primary">book</span>
								<span className="word inline-block text-primary">appointments</span>
							</h1>

							{/* Subtitle */}
							<p data-hero-subtitle className="mt-5 max-w-lg text-lg text-muted-foreground leading-relaxed">
								Discover local businesses, browse services, and schedule your next appointment in seconds — no account needed to start exploring.
							</p>

							{/* Search bar */}
							<div data-hero-search className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:items-center">
								<div className="relative flex-1 sm:max-w-[260px]">
									<Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										placeholder="Search services..."
										className="h-12 rounded-xl border-border/60 bg-background pl-10 text-base shadow-sm transition-shadow focus:shadow-md"
									/>
								</div>
								<div className="relative flex-1 sm:max-w-[200px]">
									<MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										placeholder="City or zip code"
										className="h-12 rounded-xl border-border/60 bg-background pl-10 text-base shadow-sm transition-shadow focus:shadow-md"
									/>
								</div>
								<Button size="lg" className="h-12 rounded-xl px-6 text-base font-semibold shadow-md shadow-primary/20 transition-shadow hover:shadow-lg hover:shadow-primary/30" asChild>
									<Link href="/search">
										Search
										<ArrowRight className="ml-1.5 h-4 w-4" />
									</Link>
								</Button>
							</div>

							{/* Trust highlights */}
							<div data-hero-trust className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
								<div className="flex items-center gap-1.5">
									<Zap className="h-4 w-4 text-yellow-500" />
									<span><strong className="text-foreground">Instant</strong> confirmation</span>
								</div>
								<div className="flex items-center gap-1.5">
									<Clock className="h-4 w-4 text-primary" />
									<span>Book in <strong className="text-foreground">30 seconds</strong></span>
								</div>
								<div className="flex items-center gap-1.5">
									<CheckCircle2 className="h-4 w-4 text-green-500" />
									<span><strong className="text-foreground">No calls</strong> needed</span>
								</div>
							</div>
						</div>

						{/* Right: Hero image */}
						<div data-hero-image className="relative hidden lg:block">
							<div className="relative rounded-2xl border bg-card shadow-2xl shadow-primary/10 overflow-hidden">
								<Image
									src="/images/landing/hero-booking.jpg"
									alt="BookEasely dashboard"
									width={600}
									height={420}
									className="w-full object-cover"
									priority
								/>
								{/* Floating cards overlay */}
								<div className="absolute bottom-4 left-4 right-4 flex gap-3">
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 1, duration: 0.5 }}
										className="flex-1 rounded-xl border bg-background/90 backdrop-blur-md p-3 shadow-lg"
									>
										<div className="flex items-center gap-2">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
												<CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
											</div>
											<div>
												<p className="text-xs font-semibold">Booking Confirmed</p>
												<p className="text-[10px] text-muted-foreground">Today at 2:30 PM</p>
											</div>
										</div>
									</motion.div>
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 1.3, duration: 0.5 }}
										className="rounded-xl border bg-background/90 backdrop-blur-md p-3 shadow-lg"
									>
										<div className="flex items-center gap-1">
											{[1, 2, 3, 4, 5].map((s) => (
												<Star key={s} className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
											))}
										</div>
										<p className="mt-0.5 text-[10px] text-muted-foreground">98 reviews</p>
									</motion.div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ═══════════════════ CATEGORIES ═══════════════════ */}
			<section ref={categoriesRef} className="border-t border-b bg-muted/20">
				<div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2 data-section-heading className="text-2xl font-bold tracking-tight sm:text-3xl">Browse by category</h2>
						<p data-section-sub className="mt-2 text-muted-foreground">Find the right service for you</p>
					</div>

					<div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
						{categories.map((cat) => (
							<Link
								key={cat.slug}
								href={`/search?category=${cat.slug}`}
								data-category-card
							>
								<motion.div
									whileHover={{ y: -4, boxShadow: '0 8px 30px -8px rgba(0,0,0,0.12)' }}
									transition={{ type: 'spring', stiffness: 400, damping: 25 }}
									className="flex flex-col items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/20 cursor-pointer"
								>
									<motion.div
										whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
										transition={{ duration: 0.4 }}
										className={`flex h-12 w-12 items-center justify-center rounded-xl ${cat.color}`}
									>
										<cat.icon className="h-5 w-5" />
									</motion.div>
									<span className="text-xs font-medium text-center sm:text-sm">{cat.name}</span>
								</motion.div>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
			<section ref={howItWorksRef} className="relative overflow-hidden">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,oklch(0.85_0.06_255/0.08),transparent)]" />
				<div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2 data-section-heading className="text-2xl font-bold tracking-tight sm:text-3xl">How it works</h2>
						<p data-section-sub className="mt-2 text-muted-foreground">Three simple steps to your next appointment</p>
					</div>

					<div className="mt-16 grid gap-8 md:grid-cols-3 md:gap-4">
						{steps.map((step, i) => (
							<div key={step.number} className="relative" data-step-card>
								{/* Connector line (between cards) */}
								{i < steps.length - 1 && (
									<div
										data-connector
										className="absolute top-12 left-[calc(50%+60px)] right-[-calc(50%-60px)] hidden h-[2px] bg-gradient-to-r from-primary/30 to-primary/10 md:block"
										style={{ width: 'calc(100% - 120px)', left: 'calc(50% + 60px)' }}
									/>
								)}

								<div className="flex flex-col items-center text-center">
									{/* Number + Icon */}
									<div className="relative">
										<div data-step-icon className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-primary/20 bg-primary/5 transition-colors">
											<step.icon className="h-10 w-10 text-primary" />
										</div>
										<span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md shadow-primary/30">
											{step.number}
										</span>
									</div>
									<h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
									<p className="mt-2 max-w-[240px] text-sm text-muted-foreground leading-relaxed">{step.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ═══════════════════ FEATURED BUSINESSES ═══════════════════ */}
			<section ref={featuredRef} className="border-t bg-muted/20">
				<div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between">
						<div>
							<h2 data-section-heading className="text-2xl font-bold tracking-tight sm:text-3xl">Popular near you</h2>
							<p className="mt-1 text-sm text-muted-foreground">Top-rated businesses in your area</p>
						</div>
						<Button variant="ghost" size="sm" className="text-primary" asChild>
							<Link href="/search">
								See all
								<ArrowRight className="ml-1 h-4 w-4" />
							</Link>
						</Button>
					</div>

					<div className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{featuredBusinesses.map((business) => (
							<div key={business.id} data-business-card>
								<BusinessCard business={business} />
							</div>
						))}
					</div>

					{featuredBusinesses.length === 0 && (
						<div className="flex flex-col items-center justify-center py-16 text-center">
							<Search className="h-10 w-10 text-muted-foreground/30" />
							<h3 className="mt-4 font-semibold">No businesses yet</h3>
							<p className="mt-1 text-sm text-muted-foreground">
								Be the first to list your business on BookEasely
							</p>
						</div>
					)}
				</div>
			</section>

			{/* ═══════════════════ VALUE PROPS ═══════════════════ */}
			<section ref={statsRef} className="border-t">
				<div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
					<div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
						{valueProps.map((prop) => (
							<div key={prop.title} data-stat-card className="flex flex-col items-center text-center rounded-2xl border bg-card p-6 shadow-sm">
								<div data-stat-icon className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
									<prop.icon className="h-6 w-6" />
								</div>
								<h3 className="mt-4 text-lg font-bold tracking-tight">{prop.title}</h3>
								<p className="mt-1 text-sm text-muted-foreground leading-relaxed">{prop.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ═══════════════════ WHY BOOKEASELY ═══════════════════ */}
			<section ref={testimonialsRef} className="border-t bg-muted/20">
				<div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2 data-section-heading className="text-2xl font-bold tracking-tight sm:text-3xl">Built for everyone</h2>
						<p data-section-sub className="mt-2 text-muted-foreground">Whether you run a business or just need an appointment</p>
					</div>

					<div className="mt-12 grid gap-6 md:grid-cols-2">
						{whyFeatures.map((feature) => (
							<div
								key={feature.title}
								data-feature-card
								className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm"
							>
								<div className="flex items-center gap-3">
									<div className={`flex h-10 w-10 items-center justify-center rounded-xl ${feature.color}`}>
										<feature.icon className="h-5 w-5" />
									</div>
									<h3 className="text-lg font-semibold">{feature.title}</h3>
								</div>
								<ul className="mt-5 space-y-3">
									{feature.items.map((item) => (
										<li key={item} data-check-item className="flex items-start gap-2.5 text-sm text-muted-foreground">
											<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
											<span>{item}</span>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ═══════════════════ CTA ═══════════════════ */}
			<section ref={ctaRef} className="border-t">
				<div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
					<div data-cta-box className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 sm:px-16 sm:py-20">
						{/* Background effects */}
						<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.65_0.22_255)_0%,transparent_60%)]" />
						<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.50_0.20_280)_0%,transparent_50%)]" />
						<div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20.5z\'/%3E%3C/g%3E%3C/svg%3E")' }} />

						<div data-cta-content className="relative mx-auto max-w-xl text-center text-primary-foreground">
							<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
								Grow your business with BookEasely
							</h2>
							<p className="mt-4 text-lg text-primary-foreground/80 leading-relaxed">
								List your business, manage bookings effortlessly, and let customers find you 24/7. Free to get started.
							</p>
							<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
								<Button
									size="lg"
									variant="secondary"
									className="h-12 rounded-xl px-8 text-base font-semibold text-primary shadow-lg transition-shadow hover:shadow-xl"
									asChild
								>
									<Link href="/auth/signup">
										Get started free
										<ArrowRight className="ml-2 h-4 w-4" />
									</Link>
								</Button>
								<Button
									size="lg"
									variant="ghost"
									className="h-12 rounded-xl px-8 text-base font-semibold text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/10"
									asChild
								>
									<Link href="/search">
										Explore businesses
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ═══════════════════ FOOTER ═══════════════════ */}
			<footer data-footer className="border-t">
				<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
					<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
						{/* Brand */}
						<div data-footer-col className="lg:col-span-1">
							<Link href="/" className="flex items-center gap-2">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
									<Calendar className="h-4 w-4 text-primary-foreground" />
								</div>
								<span className="text-lg font-semibold tracking-tight">BookEasely</span>
							</Link>
							<p className="mt-3 max-w-xs text-sm text-muted-foreground leading-relaxed">
								The simplest way to book appointments with local businesses. No hassle, no calls.
							</p>
						</div>

						{/* Product */}
						<div data-footer-col>
							<h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Product</h3>
							<ul className="mt-3 space-y-2.5">
								{['Search Businesses', 'Book Appointments', 'For Business Owners'].map((item) => (
									<li key={item}>
										<Link href="/search" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
											{item}
										</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Company */}
						<div data-footer-col>
							<h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Company</h3>
							<ul className="mt-3 space-y-2.5">
								{['About', 'Blog', 'Careers'].map((item) => (
									<li key={item}>
										<Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
											{item}
										</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Legal */}
						<div data-footer-col>
							<h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Legal</h3>
							<ul className="mt-3 space-y-2.5">
								{['Terms of Service', 'Privacy Policy', 'Cookie Policy'].map((item) => (
									<li key={item}>
										<Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
											{item}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>

					<div className="mt-10 border-t pt-6">
						<p className="text-center text-xs text-muted-foreground">
							&copy; {new Date().getFullYear()} BookEasely. All rights reserved.
						</p>
					</div>
				</div>
			</footer>
		</div>
	)
}
