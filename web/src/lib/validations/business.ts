import { z } from 'zod'

export const businessProfileSchema = z.object({
	name: z.string().min(2, 'Business name must be at least 2 characters'),
	description: z.string(),
	category_id: z.string().nullable(),
	address: z.string().min(1, 'Address is required'),
	city: z.string().min(1, 'City is required'),
	state: z.string().min(1, 'State is required'),
	zip_code: z.string().min(1, 'ZIP code is required'),
	phone: z.string().min(10, 'Please enter a valid phone number'),
	email: z.string(),
	website: z.string(),
})

export const businessSettingsSchema = z.object({
	cancellation_policy: z.string(),
	cancellation_hours: z.number().int().min(1).max(168),
	auto_confirm: z.boolean(),
	buffer_minutes: z.number().int().min(0).max(120),
})

export const serviceSchema = z.object({
	name: z.string().min(1, 'Service name is required'),
	description: z.string(),
	price: z.number().min(0.01, 'Price must be at least $0.01'),
	duration_minutes: z.number().int().min(5, 'Duration must be at least 5 minutes').max(480, 'Duration cannot exceed 8 hours'),
	is_active: z.boolean(),
})

export const workerSchema = z.object({
	display_name: z.string().min(1, 'Display name is required'),
	bio: z.string(),
	specialties: z.array(z.string()),
	is_active: z.boolean(),
})

const businessHourEntrySchema = z.object({
	day_of_week: z.number().int().min(0).max(6),
	open_time: z.string(),
	close_time: z.string(),
	is_closed: z.boolean(),
})

export const businessHoursSchema = z.array(businessHourEntrySchema).length(7, 'Must provide hours for all 7 days')

const workerAvailabilityEntrySchema = z.object({
	day_of_week: z.number().int().min(0).max(6),
	start_time: z.string(),
	end_time: z.string(),
	is_active: z.boolean(),
})

export const workerAvailabilitySchema = z.array(workerAvailabilityEntrySchema)

export const blockedDateSchema = z.object({
	date: z.string().min(1, 'Date is required'),
	start_time: z.string(),
	end_time: z.string(),
	reason: z.string(),
})

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>
export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>
export type ServiceInput = z.infer<typeof serviceSchema>
export type WorkerInput = z.infer<typeof workerSchema>
export type BusinessHoursInput = z.infer<typeof businessHoursSchema>
export type WorkerAvailabilityInput = z.infer<typeof workerAvailabilitySchema>
export type BlockedDateInput = z.infer<typeof blockedDateSchema>
