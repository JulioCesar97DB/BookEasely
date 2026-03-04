import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EXPO_ACCESS_TOKEN = Deno.env.get('EXPO_ACCESS_TOKEN')

interface SendPushRequest {
	user_id: string
	title: string
	body: string
	data?: Record<string, unknown>
}

serve(async (req) => {
	if (req.method !== 'POST') {
		return new Response('Method not allowed', { status: 405 })
	}

	try {
		const { user_id, title, body, data } = (await req.json()) as SendPushRequest

		if (!user_id || !title || !body) {
			return Response.json({ error: 'user_id, title, and body are required' }, { status: 400 })
		}

		// Get user's active push tokens
		const supabase = createClient(
			Deno.env.get('SUPABASE_URL')!,
			Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
		)

		const { data: tokens } = await supabase
			.from('push_tokens')
			.select('expo_token')
			.eq('user_id', user_id)
			.eq('is_active', true)

		if (!tokens || tokens.length === 0) {
			return Response.json({ success: true, skipped: true, reason: 'No active push tokens' })
		}

		// Build Expo push messages
		const messages = tokens.map((t: { expo_token: string }) => ({
			to: t.expo_token,
			sound: 'default',
			title,
			body,
			data: data ?? {},
		}))

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		}
		if (EXPO_ACCESS_TOKEN) {
			headers['Authorization'] = `Bearer ${EXPO_ACCESS_TOKEN}`
		}

		const response = await fetch('https://exp.host/--/api/v2/push/send', {
			method: 'POST',
			headers,
			body: JSON.stringify(messages),
		})

		const result = await response.json()

		if (!response.ok) {
			console.error('Expo Push error:', result)
			return Response.json({ error: 'Failed to send push notification' }, { status: 500 })
		}

		// Deactivate invalid tokens
		if (result.data) {
			for (let i = 0; i < result.data.length; i++) {
				const ticket = result.data[i]
				if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
					await supabase
						.from('push_tokens')
						.update({ is_active: false })
						.eq('expo_token', tokens[i].expo_token)
				}
			}
		}

		return Response.json({
			success: true,
			ticket_ids: result.data?.map((t: { id?: string }) => t.id).filter(Boolean) ?? [],
		})
	} catch (error) {
		console.error('send-push error:', error)
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
})
