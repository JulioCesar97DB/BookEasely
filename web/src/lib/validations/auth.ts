import { z } from 'zod'

export const signUpSchema = z.object({
	full_name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.email('Please enter a valid email'),
	phone: z.string().min(10, 'Please enter a valid phone number'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
	confirm_password: z.string(),
	role: z.enum(['client', 'business_owner']),
}).refine((data) => data.password === data.confirm_password, {
	message: 'Passwords do not match',
	path: ['confirm_password'],
})

export const signInSchema = z.object({
	email: z.email('Please enter a valid email'),
	password: z.string().min(1, 'Password is required'),
})

export const resetPasswordSchema = z.object({
	email: z.email('Please enter a valid email'),
})

export const updatePasswordSchema = z.object({
	password: z.string().min(8, 'Password must be at least 8 characters'),
	confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
	message: 'Passwords do not match',
	path: ['confirm_password'],
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
