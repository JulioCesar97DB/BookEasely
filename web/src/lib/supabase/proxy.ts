import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes accessible without authentication
const publicRoutes = ['/', '/search', '/business']

// Auth routes — logged-in users get redirected to /dashboard
const authRoutes = ['/auth/login', '/auth/signup', '/auth/reset-password']

// Auth routes accessible regardless of auth state
const openAuthRoutes = ['/auth/verify', '/auth/update-password', '/auth/callback']

function isPublicRoute(pathname: string) {
	// Exact match for root
	if (pathname === '/') return true
	// Prefix match for other public routes
	return publicRoutes.some(
		(route) => route !== '/' && (pathname === route || pathname.startsWith(route + '/'))
	)
}

function isAuthRoute(pathname: string) {
	return authRoutes.some((route) => pathname.startsWith(route))
}

function isOpenAuthRoute(pathname: string) {
	return openAuthRoutes.some((route) => pathname.startsWith(route))
}

export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	})

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll()
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
					supabaseResponse = NextResponse.next({
						request,
					})
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options)
					)
				},
			},
		}
	)

	// Use getClaims() — lighter than getUser(), no DB round-trip
	const { data } = await supabase.auth.getClaims()
	const user = data?.claims

	const { pathname } = request.nextUrl

	// Open auth routes (verify, update-password, callback) — always accessible
	if (isOpenAuthRoute(pathname)) {
		return supabaseResponse
	}

	// Auth routes (login, signup, reset) — redirect logged-in users to dashboard
	if (isAuthRoute(pathname)) {
		if (user) {
			const url = request.nextUrl.clone()
			url.pathname = '/dashboard'
			return NextResponse.redirect(url)
		}
		return supabaseResponse
	}

	// Public routes — always accessible
	if (isPublicRoute(pathname)) {
		return supabaseResponse
	}

	// Everything else is protected — redirect to login if not authenticated
	if (!user) {
		const url = request.nextUrl.clone()
		url.pathname = '/auth/login'
		url.searchParams.set('next', pathname)
		return NextResponse.redirect(url)
	}

	return supabaseResponse
}
