import { z } from 'zod'

export const businessProfileSchema = z.object({
	name: z.string().min(2, 'Business name must be at least 2 characters'),
	description: z.string().optional().default(''),
	category_id: z.string().uuid('Please select a category').optional().nullable(),
	address: z.string().min(1, 'Address is required'),
	city: z.string().min(1, 'City is required'),
	state: z.string().min(1, 'State is required'),
	zip_code: z.string().min(1, 'ZIP code is required'),
	phone: z.string().min(10, 'Please enter a valid phone number'),
	email: z.email('Please enter a valid email').optional().or(z.literal('')),
	website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
	cancellation_policy: z.string().optional().default(''),
	cancellation_hours: z.number().int().min(1).max(168).default(24),
	auto_confirm: z.boolean().default(true),
	buffer_minutes: z.number().int().min(0).max(120).default(0),
})

export const serviceSchema = z.object({
	name: z.string().min(1, 'Service name is required'),
	description: z.string().optional().default(''),
	price: z.number().min(0.01, 'Price must be at least $0.01'),
	duration_minutes: z.number().int().min(5, 'Duration must be at least 5 minutes').max(480, 'Duration cannot exceed 8 hours'),
	is_active: z.boolean().default(true),
})

export const workerSchema = z.object({
	display_name: z.string().min(1, 'Display name is required'),
	bio: z.string().optional().default(''),
	specialties: z.array(z.string()).default([]),
	is_active: z.boolean().default(true),
})

const businessHourEntrySchema = z.object({
	day_of_week: z.number().int().min(0).max(6),
	open_time: z.string(),
	close_time: z.string(),
	is_closed: z.boolean().default(false),
})

export const businessHoursSchema = z.array(businessHourEntrySchema).length(7, 'Must provide hours for all 7 days')

const workerAvailabilityEntrySchema = z.object({
	day_of_week: z.number().int().min(0).max(6),
	start_time: z.string(),
	end_time: z.string(),
	is_active: z.boolean().default(true),
})

export const workerAvailabilitySchema = z.array(workerAvailabilityEntrySchema)

export const blockedDateSchema = z.object({
	date: z.string().min(1, 'Date is required'),
	start_time: z.string().optional().or(z.literal('')),
	end_time: z.string().optional().or(z.literal('')),
	reason: z.string().optional().default(''),
})

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>
export type ServiceInput = z.infer<typeof serviceSchema>
export type WorkerInput = z.infer<typeof workerSchema>
export type BusinessHoursInput = z.infer<typeof businessHoursSchema>
export type WorkerAvailabilityInput = z.infer<typeof workerAvailabilitySchema>
export type BlockedDateInput = z.infer<typeof blockedDateSchema>
