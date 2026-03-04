import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async () => {
	try {
		const supabase = createClient(
			Deno.env.get('SUPABASE_URL')!,
			Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
		)

		// Get tomorrow's date in YYYY-MM-DD format
		const tomorrow = new Date()
		tomorrow.setDate(tomorrow.getDate() + 1)
		const tomorrowStr = tomorrow.toISOString().split('T')[0]

		// Find confirmed bookings for tomorrow that haven't received a reminder
		const { data: bookings, error } = await supabase
			.from('bookings')
			.select('id, client_id, worker_id, service_id, date, start_time, business_id')
			.eq('date', tomorrowStr)
			.eq('status', 'confirmed')
			.is('reminder_sent_at', null)

		if (error) {
			console.error('Failed to fetch bookings:', error)
			return Response.json({ error: error.message }, { status: 500 })
		}

		if (!bookings || bookings.length === 0) {
			return Response.json({ message: 'No reminders to send', count: 0 })
		}

		const baseUrl = Deno.env.get('SUPABASE_URL')!
		const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
		let sentCount = 0

		// Send SMS reminders to clients
		for (const booking of bookings) {
			// Look up service and business names
			const [serviceResult, businessResult] = await Promise.all([
				supabase.from('services').select('name').eq('id', booking.service_id).single(),
				supabase.from('businesses').select('name').eq('id', booking.business_id).single(),
			])

			const serviceName = serviceResult.data?.name ?? 'your appointment'
			const businessName = businessResult.data?.name ?? 'the business'
			const body = `Reminder: ${serviceName} at ${businessName} tomorrow at ${booking.start_time}.`

			// Check reminder preference before sending
			const { data: prefs } = await supabase
				.from('notification_preferences')
				.select('reminder_enabled')
				.eq('user_id', booking.client_id)
				.single()

			if (prefs?.reminder_enabled !== false) {
				await fetch(`${baseUrl}/functions/v1/notify`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${serviceKey}`,
					},
					body: JSON.stringify({
						user_id: booking.client_id,
						type: 'booking_reminder',
						title: 'Appointment Tomorrow',
						body,
						data: { booking_id: booking.id },
						channels: ['sms'],
					}),
				})
			}

			// Mark reminder as sent
			await supabase
				.from('bookings')
				.update({ reminder_sent_at: new Date().toISOString() })
				.eq('id', booking.id)

			sentCount++
		}

		// Worker morning digest: group bookings by worker
		const workerBookings = new Map<string, typeof bookings>()
		for (const booking of bookings) {
			if (!booking.worker_id) continue
			const existing = workerBookings.get(booking.worker_id) ?? []
			existing.push(booking)
			workerBookings.set(booking.worker_id, existing)
		}

		for (const [workerId, workerBkgs] of workerBookings) {
			// Look up worker's user_id
			const { data: worker } = await supabase
				.from('workers')
				.select('user_id, display_name')
				.eq('id', workerId)
				.single()

			if (!worker?.user_id) continue

			const body = `You have ${workerBkgs.length} appointment${workerBkgs.length > 1 ? 's' : ''} tomorrow. First one at ${workerBkgs[0]!.start_time}.`

			await fetch(`${baseUrl}/functions/v1/notify`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${serviceKey}`,
				},
				body: JSON.stringify({
					user_id: worker.user_id,
					type: 'worker_daily_digest',
					title: 'Tomorrow\'s Schedule',
					body,
					data: { date: tomorrowStr },
					channels: ['push'],
				}),
			})
		}

		return Response.json({ success: true, reminders_sent: sentCount, workers_notified: workerBookings.size })
	} catch (error) {
		console.error('daily-reminders error:', error)
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
})
