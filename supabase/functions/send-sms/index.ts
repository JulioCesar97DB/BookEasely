import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')!
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')!

interface SendSmsRequest {
	phone: string
	message: string
}

serve(async (req) => {
	if (req.method !== 'POST') {
		return new Response('Method not allowed', { status: 405 })
	}

	try {
		const { phone, message } = (await req.json()) as SendSmsRequest

		if (!phone || !message) {
			return Response.json({ error: 'phone and message are required' }, { status: 400 })
		}

		const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
		const body = new URLSearchParams({
			From: TWILIO_PHONE_NUMBER,
			To: phone,
			Body: message,
		})

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: body.toString(),
		})

		const result = await response.json()

		if (!response.ok) {
			console.error('Twilio error:', result)
			return Response.json({ error: result.message ?? 'Failed to send SMS' }, { status: 500 })
		}

		return Response.json({ success: true, message_sid: result.sid })
	} catch (error) {
		console.error('send-sms error:', error)
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
})
