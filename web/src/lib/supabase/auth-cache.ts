import type { UserRole } from '@/lib/types'
import { cache } from 'react'
import { createClient } from './server'

/**
 * Cached auth helpers — deduplicate Supabase calls within a single
 * server request. The proxy/middleware already handles auth guards,
 * so these helpers just fetch data (no redirects).
 */

export const getAuthUser = cache(async () => {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	return user
})

export const getAuthProfile = cache(async () => {
	const supabase = await createClient()
	const user = await getAuthUser()
	if (!user) return null

	const { data: profile } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', user.id)
		.single()

	return profile
})

export const getUserRole = cache(async (): Promise<UserRole> => {
	const user = await getAuthUser()
	const profile = await getAuthProfile()
	return (profile?.role ?? user?.user_metadata?.role ?? 'client') as UserRole
})

export const getUserBusiness = cache(async () => {
	const supabase = await createClient()
	const user = await getAuthUser()
	if (!user) return null

	const { data: business } = await supabase
		.from('businesses')
		.select('*')
		.eq('owner_id', user.id)
		.single()

	return business
})

export const getIsWorker = cache(async () => {
	const supabase = await createClient()
	const user = await getAuthUser()
	if (!user) return false

	const { count } = await supabase
		.from('workers')
		.select('id', { count: 'exact', head: true })
		.eq('user_id', user.id)
		.eq('is_active', true)

	return (count ?? 0) > 0
})
