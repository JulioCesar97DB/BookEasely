'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function sendOtp(phone: string, metadata?: { full_name?: string; role?: string }) {
	const supabase = await createClient()

	const { error } = await supabase.auth.signInWithOtp({
		phone,
		options: metadata ? { data: metadata } : undefined,
	})

	if (error) {
		return { error: error.message }
	}

	return { success: true }
}

export async function verifyOtp(phone: string, token: string) {
	const supabase = await createClient()

	const { error } = await supabase.auth.verifyOtp({
		phone,
		token,
		type: 'sms',
	})

	if (error) {
		return { error: error.message }
	}

	redirect('/dashboard/discover')
}

export async function signInWithGoogle() {
	const supabase = await createClient()
	const origin = (await headers()).get('origin')

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: 'google',
		options: {
			redirectTo: `${origin}/auth/callback`,
		},
	})

	if (error) {
		return { error: error.message }
	}

	if (data.url) {
		redirect(data.url)
	}
}

export async function signOut() {
	const supabase = await createClient()
	await supabase.auth.signOut()
	redirect('/')
}
