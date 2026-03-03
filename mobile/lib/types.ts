export type UserRole = 'client' | 'business_owner' | 'worker' | 'admin'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export interface Profile {
	id: string
	email: string
	full_name: string
	phone: string
	avatar_url: string | null
	role: UserRole
	onboarding_completed: boolean
	created_at: string
	updated_at: string
}

export interface Category {
	id: string
	name: string
	slug: string
	icon_url: string | null
	sort_order: number
}

export interface Business {
	id: string
	owner_id: string
	name: string
	slug: string
	description: string | null
	category_id: string | null
	address: string
	city: string
	state: string
	zip_code: string
	country: string
	phone: string
	email: string | null
	website: string | null
	latitude: number | null
	longitude: number | null
	cover_image_url: string | null
	logo_url: string | null
	photos: string[]
	cancellation_policy: string | null
	cancellation_hours: number
	auto_confirm: boolean
	buffer_minutes: number
	rating_avg: number
	rating_count: number
	is_active: boolean
	created_at: string
	updated_at: string
}

export interface Service {
	id: string
	business_id: string
	name: string
	description: string | null
	price: number
	duration_minutes: number
	is_active: boolean
	created_at: string
}

export interface BusinessHours {
	id: string
	business_id: string
	day_of_week: number
	open_time: string
	close_time: string
	is_closed: boolean
}

export interface Worker {
	id: string
	user_id: string
	business_id: string
	display_name: string
	bio: string | null
	avatar_url: string | null
	specialties: string[] | null
	is_active: boolean
	created_at: string
}

export interface WorkerAvailability {
	id: string
	worker_id: string
	day_of_week: number
	start_time: string
	end_time: string
	is_active: boolean
}

export interface WorkerBlockedDate {
	id: string
	worker_id: string
	date: string
	start_time: string | null
	end_time: string | null
	reason: string | null
}

export interface ServiceWorker {
	id: string
	service_id: string
	worker_id: string
}

export interface Booking {
	id: string
	client_id: string
	business_id: string
	worker_id: string
	service_id: string
	date: string
	start_time: string
	end_time: string
	status: BookingStatus
	note: string | null
	cancelled_by: string | null
	cancellation_reason: string | null
	created_at: string
	updated_at: string
}

export interface BusinessWithCategory extends Business {
	categories?: { name: string; slug: string } | null
}

export interface Review {
	id: string
	booking_id: string
	client_id: string
	business_id: string
	rating: number
	comment: string | null
	business_response: string | null
	is_flagged: boolean
	created_at: string
	updated_at: string
}

export interface Notification {
	id: string
	user_id: string
	type: string
	title: string
	body: string
	is_read: boolean
	data: Record<string, unknown> | null
	created_at: string
}

export interface Favorite {
	id: string
	client_id: string
	business_id: string
	created_at: string
}

export interface WorkerInvitation {
	id: string
	business_id: string
	email: string
	display_name: string
	bio: string | null
	specialties: string[] | null
	invited_by: string
	status: 'pending' | 'accepted' | 'declined' | 'expired'
	created_at: string
	accepted_at: string | null
}

// --- Supabase join result types ---
// These match the shapes returned by Supabase queries with nested selects.

// --- Supabase join result types ---
// Supabase's generated TypeScript types model foreign key joins as arrays,
// even when the relationship is many-to-one (where the runtime value is a single
// object). These "Raw" types match the Supabase TS output. The helper functions
// below convert them to the flattened app-level types used by components.

/** Raw Supabase result for client bookings query */
interface ClientBookingRaw {
	id: string
	date: string
	start_time: string
	end_time: string
	status: string
	business_id: string
	service_id: string
	worker_id: string
	services: { name: string; price: number }[]
	businesses: { name: string; slug: string }[]
	workers: { display_name: string }[]
}

/** App-level client booking with joined relations as single objects */
export interface ClientBookingRow {
	id: string
	date: string
	start_time: string
	end_time: string
	status: string
	business_id: string
	service_id: string
	worker_id: string
	services: { name: string; price: number } | null
	businesses: { name: string; slug: string } | null
	workers: { display_name: string } | null
}

/** Convert raw Supabase client bookings to app-level type */
export function toClientBookings(rows: unknown[]): ClientBookingRow[] {
	return (rows as ClientBookingRaw[]).map((r) => ({
		...r,
		services: Array.isArray(r.services) ? r.services[0] ?? null : r.services,
		businesses: Array.isArray(r.businesses) ? r.businesses[0] ?? null : r.businesses,
		workers: Array.isArray(r.workers) ? r.workers[0] ?? null : r.workers,
	}))
}

/** Raw Supabase result for worker appointments query */
interface WorkerAppointmentRaw {
	id: string
	date: string
	start_time: string
	end_time: string
	status: string
	note: string | null
	services: { name: string; duration_minutes: number; price: number }[]
	profiles: { full_name: string }[]
}

/** App-level worker appointment with joined relations as single objects */
export interface WorkerAppointmentRow {
	id: string
	date: string
	start_time: string
	end_time: string
	status: string
	note: string | null
	services: { name: string; duration_minutes: number; price: number } | null
	profiles: { full_name: string } | null
}

/** Convert raw Supabase worker appointments to app-level type */
export function toWorkerAppointments(rows: unknown[]): WorkerAppointmentRow[] {
	return (rows as WorkerAppointmentRaw[]).map((r) => ({
		...r,
		services: Array.isArray(r.services) ? r.services[0] ?? null : r.services,
		profiles: Array.isArray(r.profiles) ? r.profiles[0] ?? null : r.profiles,
	}))
}

/** Raw Supabase result for workers with business join */
interface WorkerWithBusinessRaw {
	id: string
	display_name: string
	business_id: string
	businesses: { name: string }[]
}

/** App-level worker record with business as single object */
export interface WorkerWithBusiness {
	id: string
	display_name: string
	business_id: string
	businesses: { name: string } | null
}

/** Convert raw Supabase worker-with-business rows to app-level type */
export function toWorkersWithBusiness(rows: unknown[]): WorkerWithBusiness[] {
	return (rows as WorkerWithBusinessRaw[]).map((r) => ({
		...r,
		businesses: Array.isArray(r.businesses) ? r.businesses[0] ?? null : r.businesses,
	}))
}

/** Raw Supabase result for service_workers with worker join */
interface ServiceWorkerRaw {
	worker_id: string
	workers: { id: string; display_name: string; is_active: boolean }[]
}

/** App-level service-worker row with worker as single object */
export interface ServiceWorkerRow {
	worker_id: string
	workers: { id: string; display_name: string; is_active: boolean } | null
}

/** Convert raw Supabase service-worker rows to app-level type */
export function toServiceWorkerRows(rows: unknown[]): ServiceWorkerRow[] {
	return (rows as ServiceWorkerRaw[]).map((r) => ({
		...r,
		workers: Array.isArray(r.workers) ? r.workers[0] ?? null : r.workers,
	}))
}
