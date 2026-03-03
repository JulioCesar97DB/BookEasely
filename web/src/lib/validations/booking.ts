import { z } from 'zod'

const uuid = z.string().uuid('Invalid ID format')
const timeStr = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Invalid time format (HH:MM)')
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')

export const getAvailableSlotsSchema = z.object({
	businessId: uuid,
	serviceId: uuid,
	workerId: uuid,
	date: dateStr,
})

export const getAvailableWorkersSchema = z.object({
	businessId: uuid,
	serviceId: uuid,
	date: dateStr,
})

export const createBookingSchema = z.object({
	businessId: uuid,
	serviceId: uuid,
	workerId: uuid,
	date: dateStr,
	startTime: timeStr,
	endTime: timeStr,
	note: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
})

export const cancelBookingSchema = z.object({
	bookingId: uuid,
	reason: z.string().max(500, 'Reason cannot exceed 500 characters').optional(),
})

export const rescheduleBookingSchema = z.object({
	bookingId: uuid,
	workerId: uuid,
	date: dateStr,
	startTime: timeStr,
	endTime: timeStr,
})

export const submitReviewSchema = z.object({
	bookingId: uuid,
	businessId: uuid,
	rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
	comment: z.string().max(1000, 'Comment cannot exceed 1000 characters').optional(),
})

export const respondToReviewSchema = z.object({
	reviewId: uuid,
	response: z.string().min(1, 'Response is required').max(1000, 'Response cannot exceed 1000 characters'),
})

export const notificationIdSchema = z.string().uuid('Invalid notification ID')
export const bookingIdSchema = z.string().uuid('Invalid booking ID')
export const businessIdSchema = z.string().uuid('Invalid business ID')
