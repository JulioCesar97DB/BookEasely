import { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Profile, UserRole } from './types'

interface AuthState {
	session: Session | null
	user: User | null
	profile: Profile | null
	isLoading: boolean
}

interface AuthContextType extends AuthState {
	signIn: (email: string, password: string) => Promise<{ error: string | null }>
	signUp: (email: string, password: string, metadata: Record<string, string>) => Promise<{ error: string | null }>
	signOut: () => Promise<void>
	resetPassword: (email: string) => Promise<{ error: string | null }>
	refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

function buildFallbackProfile(user: User): Profile {
	const meta = user.user_metadata ?? {}
	return {
		id: user.id,
		email: user.email ?? '',
		full_name: meta.full_name ?? '',
		phone: meta.phone ?? '',
		role: (meta.role ?? 'client') as UserRole,
		avatar_url: null,
		onboarding_completed: false,
		created_at: user.created_at,
		updated_at: user.created_at,
	}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<AuthState>({
		session: null,
		user: null,
		profile: null,
		isLoading: true,
	})

	async function fetchProfile(userId: string): Promise<Profile | null> {
		const { data } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', userId)
			.single()
		return data as Profile | null
	}

	async function getProfileWithFallback(user: User): Promise<Profile> {
		const dbProfile = await fetchProfile(user.id)
		if (dbProfile) {
			// Merge: use DB values but fall back to metadata for missing fields
			return {
				...dbProfile,
				role: dbProfile.role || (user.user_metadata?.role as UserRole) || 'client',
				full_name: dbProfile.full_name || user.user_metadata?.full_name || '',
			}
		}
		// No profile row exists — build from auth metadata
		return buildFallbackProfile(user)
	}

	async function refreshProfile() {
		if (!state.user) return
		const profile = await getProfileWithFallback(state.user)
		setState((prev) => ({ ...prev, profile }))
	}

	useEffect(() => {
		supabase.auth.getSession().then(async ({ data: { session } }) => {
			const profile = session ? await getProfileWithFallback(session.user) : null
			setState({
				session,
				user: session?.user ?? null,
				profile,
				isLoading: false,
			})
		})

		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			async (_event, session) => {
				const profile = session ? await getProfileWithFallback(session.user) : null
				setState({
					session,
					user: session?.user ?? null,
					profile,
					isLoading: false,
				})
			}
		)

		return () => subscription.unsubscribe()
	}, [])

	async function signIn(email: string, password: string) {
		const { error } = await supabase.auth.signInWithPassword({ email, password })
		return { error: error?.message ?? null }
	}

	async function signUp(
		email: string,
		password: string,
		metadata: Record<string, string>
	) {
		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: { data: metadata },
		})
		return { error: error?.message ?? null }
	}

	async function signOut() {
		await supabase.auth.signOut()
	}

	async function resetPassword(email: string) {
		const { error } = await supabase.auth.resetPasswordForEmail(email)
		return { error: error?.message ?? null }
	}

	return (
		<AuthContext.Provider
			value={{
				...state,
				signIn,
				signUp,
				signOut,
				resetPassword,
				refreshProfile,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
