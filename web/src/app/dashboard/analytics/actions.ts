'use server'

import { createClient } from '@/lib/supabase/server'

export interface BookingTrendPoint {
	date: string
	completed: number
	cancelled: number
}

export interface RevenuePeriod {
	week: string
	revenue: number
}

export interface PopularService {
	name: string
	bookings: number
	fill: string
}

export interface StatusCount {
	status: string
	count: number
	fill: string
}

export interface WorkerBookings {
	name: string
	bookings: number
}

export interface AnalyticsData {
	bookingTrend: BookingTrendPoint[]
	revenue: RevenuePeriod[]
	popularServices: PopularService[]
	statusBreakdown: StatusCount[]
	workerUtilization: WorkerBookings[]
	totalRevenue: number
	totalBookings: number
	completionRate: number
}

const STATUS_COLORS: Record<string, string> = {
	completed: 'var(--chart-1)',
	confirmed: 'var(--chart-2)',
	pending: 'var(--chart-3)',
	cancelled: 'var(--chart-4)',
	no_show: 'var(--chart-5)',
}

const SERVICE_COLORS = [
	'var(--chart-1)',
	'var(--chart-2)',
	'var(--chart-3)',
	'var(--chart-4)',
	'var(--chart-5)',
]

export async function getAnalyticsData(businessId: string): Promise<AnalyticsData | null> {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return null

	// Verify ownership
	const { data: biz } = await supabase
		.from('businesses')
		.select('id')
		.eq('id', businessId)
		.eq('owner_id', user.id)
		.single()
	if (!biz) return null

	// Date ranges
	const now = new Date()
	const ninetyDaysAgo = new Date(now.getTime() - 90 * 86400000).toISOString().split('T')[0]!
	const today = now.toISOString().split('T')[0]!

	// Parallel queries — single fetch, aggregate client-side (KISS)
	const [bookingsRes, servicesRes, workersRes] = await Promise.all([
		supabase
			.from('bookings')
			.select('id, date, status, service_id, worker_id, services(price)')
			.eq('business_id', businessId)
			.gte('date', ninetyDaysAgo)
			.lte('date', today)
			.order('date'),
		supabase
			.from('services')
			.select('id, name')
			.eq('business_id', businessId)
			.eq('is_active', true),
		supabase
			.from('workers')
			.select('id, display_name')
			.eq('business_id', businessId)
			.eq('is_active', true),
	])

	// Supabase join returns services as array — cast via unknown (known Supabase limitation)
	const bookings = (bookingsRes.data ?? []) as unknown as Array<{
		id: string
		date: string
		status: string
		service_id: string
		worker_id: string
		services: { price: number } | null
	}>
	const services = servicesRes.data ?? []
	const workers = workersRes.data ?? []

	// --- Booking trend (daily) ---
	const trendMap = new Map<string, { completed: number; cancelled: number }>()
	for (const b of bookings) {
		const entry = trendMap.get(b.date) ?? { completed: 0, cancelled: 0 }
		if (b.status === 'completed') entry.completed++
		if (b.status === 'cancelled') entry.cancelled++
		trendMap.set(b.date, entry)
	}
	const bookingTrend: BookingTrendPoint[] = Array.from(trendMap.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([date, counts]) => ({ date, ...counts }))

	// --- Revenue by week ---
	const weekMap = new Map<string, number>()
	for (const b of bookings) {
		if (b.status !== 'completed' || !b.services?.price) continue
		const d = new Date(b.date)
		const weekStart = new Date(d)
		weekStart.setDate(d.getDate() - d.getDay())
		const key = weekStart.toISOString().split('T')[0]!
		weekMap.set(key, (weekMap.get(key) ?? 0) + Number(b.services.price))
	}
	const revenue: RevenuePeriod[] = Array.from(weekMap.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([week, rev]) => ({ week, revenue: rev }))

	// --- Popular services (top 5) ---
	const serviceCountMap = new Map<string, number>()
	for (const b of bookings) {
		serviceCountMap.set(b.service_id, (serviceCountMap.get(b.service_id) ?? 0) + 1)
	}
	const serviceNameMap = new Map(services.map((s) => [s.id, s.name]))
	const popularServices: PopularService[] = Array.from(serviceCountMap.entries())
		.sort(([, a], [, b]) => b - a)
		.slice(0, 5)
		.map(([id, count], i) => ({
			name: serviceNameMap.get(id) ?? 'Unknown',
			bookings: count,
			fill: SERVICE_COLORS[i % SERVICE_COLORS.length]!,
		}))

	// --- Status breakdown ---
	const statusMap = new Map<string, number>()
	for (const b of bookings) {
		statusMap.set(b.status, (statusMap.get(b.status) ?? 0) + 1)
	}
	const statusBreakdown: StatusCount[] = Array.from(statusMap.entries()).map(([status, count]) => ({
		status,
		count,
		fill: STATUS_COLORS[status] ?? 'var(--chart-5)',
	}))

	// --- Worker utilization ---
	const workerCountMap = new Map<string, number>()
	for (const b of bookings) {
		if (b.status === 'completed' || b.status === 'confirmed' || b.status === 'pending') {
			workerCountMap.set(b.worker_id, (workerCountMap.get(b.worker_id) ?? 0) + 1)
		}
	}
	const workerNameMap = new Map(workers.map((w) => [w.id, w.display_name]))
	const workerUtilization: WorkerBookings[] = Array.from(workerCountMap.entries())
		.sort(([, a], [, b]) => b - a)
		.map(([id, count]) => ({
			name: workerNameMap.get(id) ?? 'Unknown',
			bookings: count,
		}))

	// --- Totals ---
	const totalRevenue = revenue.reduce((sum, r) => sum + r.revenue, 0)
	const totalBookings = bookings.length
	const completedCount = bookings.filter((b) => b.status === 'completed').length
	const completionRate = totalBookings > 0 ? Math.round((completedCount / totalBookings) * 100) : 0

	return {
		bookingTrend,
		revenue,
		popularServices,
		statusBreakdown,
		workerUtilization,
		totalRevenue,
		totalBookings,
		completionRate,
	}
}
