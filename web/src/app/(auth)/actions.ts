'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
	const supabase = await createClient()

	const email = formData.get('email') as string
	const password = formData.get('password') as string
	const full_name = formData.get('full_name') as string
	const phone = formData.get('phone') as string
	const role = formData.get('role') as string

	const { error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				full_name,
				phone,
				role: role || 'client',
			},
		},
	})

	if (error) {
		return { error: error.message }
	}

	redirect('/auth/verify')
}

export async function signIn(formData: FormData) {
	const supabase = await createClient()

	const email = formData.get('email') as string
	const password = formData.get('password') as string

	const { error } = await supabase.auth.signInWithPassword({
		email,
		password,
	})

	if (error) {
		return { error: error.message }
	}

	redirect('/dashboard')
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

export async function resetPassword(formData: FormData) {
	const supabase = await createClient()
	const origin = (await headers()).get('origin')

	const email = formData.get('email') as string

	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${origin}/auth/update-password`,
	})

	if (error) {
		return { error: error.message }
	}

	return { success: 'Check your email for a password reset link.' }
}

export async function updatePassword(formData: FormData) {
	const supabase = await createClient()

	const password = formData.get('password') as string

	const { error } = await supabase.auth.updateUser({
		password,
	})

	if (error) {
		return { error: error.message }
	}

	redirect('/dashboard')
}

export async function signOut() {
	const supabase = await createClient()
	await supabase.auth.signOut()
	redirect('/')
}
