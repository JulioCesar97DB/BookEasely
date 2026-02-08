// BookEasely shared types - derived from database schema

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
