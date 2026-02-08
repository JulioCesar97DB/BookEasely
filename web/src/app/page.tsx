import { BusinessCard } from '@/components/business-card'
import { PublicHeader } from '@/components/public-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, Camera, Dog, Dumbbell, GraduationCap, Heart, MapPin, Scissors, Search, Stethoscope, Wrench } from 'lucide-react'
import Link from 'next/link'

const categories = [
	{ name: 'Barbershop', slug: 'barbershop', icon: Scissors, color: 'bg-blue-50 text-blue-600' },
	{ name: 'Fitness', slug: 'fitness-training', icon: Dumbbell, color: 'bg-green-50 text-green-600' },
	{ name: 'Spa & Massage', slug: 'spa-massage', icon: Heart, color: 'bg-pink-50 text-pink-600' },
	{ name: 'Medical', slug: 'medical-dental', icon: Stethoscope, color: 'bg-red-50 text-red-600' },
	{ name: 'Photography', slug: 'photography', icon: Camera, color: 'bg-purple-50 text-purple-600' },
	{ name: 'Pet Services', slug: 'pet-services', icon: Dog, color: 'bg-amber-50 text-amber-600' },
	{ name: 'Auto Services', slug: 'auto-services', icon: Wrench, color: 'bg-slate-50 text-slate-600' },
	{ name: 'Tutoring', slug: 'tutoring-education', icon: GraduationCap, color: 'bg-indigo-50 text-indigo-600' },
]

export default async function HomePage() {
	const supabase = await createClient()

	const { data: featuredBusinesses } = await supabase
		.from('businesses')
		.select('*, categories(name, slug)')
		.eq('is_active', true)
		.order('rating_avg', { ascending: false })
		.limit(8)

	return (
		<div className="min-h-svh">
			<PublicHeader />

			{/* Hero Section */}
			<section className="relative overflow-hidden border-b">
				<div className="absolute inset-0 bg-linear-to-br from-primary/3 via-transparent to-brand-muted/30" />
				<div className="absolute top-0 right-0 -z-10 h-125 w-125 rounded-full bg-primary/5 blur-3xl" />
				<div className="absolute bottom-0 left-0 -z-10 h-100 w-100 rounded-full bg-brand-muted/40 blur-3xl" />

				<div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
					<div className="mx-auto max-w-2xl text-center">
						<h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
							Book appointments{' '}
							<span className="text-primary">in seconds</span>
						</h1>
						<p className="mt-4 text-lg text-muted-foreground sm:text-xl">
							Discover local businesses, browse services, and schedule your next appointment — no account needed to explore.
						</p>

						<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
							<div className="relative flex-1 sm:max-w-sm">
								<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder="Search services or businesses..."
									className="h-12 pl-10 text-base"
								/>
							</div>
							<div className="relative flex-1 sm:max-w-xs">
								<MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder="City or zip code"
									className="h-12 pl-10 text-base"
								/>
							</div>
							<Button size="lg" className="h-12 px-8 text-base" asChild>
								<Link href="/search">Search</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Categories */}
			<section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">Browse by category</h2>
						<p className="mt-1 text-sm text-muted-foreground">Find the right service for you</p>
					</div>
					<Button variant="ghost" size="sm" className="text-primary" asChild>
						<Link href="/search">
							View all
							<ArrowRight className="ml-1 h-4 w-4" />
						</Link>
					</Button>
				</div>

				<div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
					{categories.map((cat) => (
						<Link
							key={cat.slug}
							href={`/search?category=${cat.slug}`}
							className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
						>
							<div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cat.color} transition-transform group-hover:scale-110`}>
								<cat.icon className="h-5 w-5" />
							</div>
							<span className="text-sm font-medium text-center">{cat.name}</span>
						</Link>
					))}
				</div>
			</section>

			{/* Popular near you */}
			<section className="border-t bg-muted/30">
				<div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-bold tracking-tight">Popular near you</h2>
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
						{(featuredBusinesses ?? []).map((business) => (
							<BusinessCard key={business.id} business={business} />
						))}
					</div>

					{(!featuredBusinesses || featuredBusinesses.length === 0) && (
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

			{/* CTA Section */}
			<section className="border-t">
				<div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
					<div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-12 sm:px-12 sm:py-16">
						<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.65_0.22_255)_0%,transparent_70%)]" />
						<div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

						<div className="relative mx-auto max-w-lg text-center text-primary-foreground">
							<h2 className="text-3xl font-bold tracking-tight">
								Own a business?
							</h2>
							<p className="mt-3 text-primary-foreground/75">
								List your business on BookEasely and start receiving bookings today. Free to get started.
							</p>
							<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
								<Button size="lg" variant="secondary" className="text-primary font-semibold" asChild>
									<Link href="/auth/signup">
										Get started free
										<ArrowRight className="ml-2 h-4 w-4" />
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t bg-muted/30">
				<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
						<p className="text-sm text-muted-foreground">
							&copy; {new Date().getFullYear()} BookEasely. All rights reserved.
						</p>
						<div className="flex gap-6">
							<Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
								Terms
							</Link>
							<Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
								Privacy
							</Link>
						</div>
					</div>
				</div>
			</footer>
		</div>
	)
}
