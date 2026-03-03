import { Alert } from 'react-native'

export function handleSupabaseError(error: { message: string } | null, context?: string): boolean {
	if (!error) return false
	const message = context ? `${context}: ${error.message}` : error.message
	Alert.alert('Error', message)
	return true
}
