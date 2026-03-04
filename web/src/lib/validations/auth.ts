import { z } from 'zod'

export const signUpSchema = z.object({
	full_name: z.string().min(2, 'Name must be at least 2 characters'),
	phone: z.string().min(10, 'Please enter a valid phone number'),
	role: z.enum(['client', 'business_owner']),
})

export const signInSchema = z.object({
	phone: z.string().min(10, 'Please enter a valid phone number'),
})

export const otpVerifySchema = z.object({
	token: z.string().length(6, 'Code must be 6 digits'),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>
