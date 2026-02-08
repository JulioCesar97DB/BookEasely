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
	created_at: string
	updated_at: string
}
