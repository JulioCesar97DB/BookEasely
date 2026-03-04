import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface NotifyRequest {
	user_id: string
	type: string
	title: string
	body: string
	data?: Record<string, unknown>
	channels: ('sms' | 'push')[]
}

serve(async (req) => {
	if (req.method !== 'POST') {
		return new Response('Method not allowed', { status: 405 })
	}

	try {
		const { user_id, type, title, body, data, channels } = (await req.json()) as NotifyRequest

		if (!user_id || !title || !body || !channels?.length) {
			return Response.json({ error: 'user_id, title, body, and channels are required' }, { status: 400 })
		}

		const supabase = createClient(
			Deno.env.get('SUPABASE_URL')!,
			Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
		)

		// Get user's notification preferences
		const { data: prefs } = await supabase
			.from('notification_preferences')
			.select('sms_enabled, push_enabled')
			.eq('user_id', user_id)
			.single()

		// Default to enabled if no preferences exist
		const smsEnabled = prefs?.sms_enabled ?? true
		const pushEnabled = prefs?.push_enabled ?? true

		const results: Record<string, unknown> = {}
		const baseUrl = Deno.env.get('SUPABASE_URL')!
		const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

		// Send SMS if requested and enabled
		if (channels.includes('sms') && smsEnabled) {
			// Get user's phone number
			const { data: profile } = await supabase
				.from('profiles')
				.select('phone')
				.eq('id', user_id)
				.single()

			if (profile?.phone) {
				const smsResponse = await fetch(`${baseUrl}/functions/v1/send-sms`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${serviceKey}`,
					},
					body: JSON.stringify({ phone: profile.phone, message: `${title}: ${body}` }),
				})
				results.sms = await smsResponse.json()
			} else {
				results.sms = { skipped: true, reason: 'No phone number' }
			}
		}

		// Send push if requested and enabled
		if (channels.includes('push') && pushEnabled) {
			const pushResponse = await fetch(`${baseUrl}/functions/v1/send-push`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${serviceKey}`,
				},
				body: JSON.stringify({ user_id, title, body, data: { ...data, type } }),
			})
			results.push = await pushResponse.json()
		}

		return Response.json({ success: true, results })
	} catch (error) {
		console.error('notify error:', error)
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
})
