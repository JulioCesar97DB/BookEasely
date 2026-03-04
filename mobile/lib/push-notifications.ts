import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { supabase } from './supabase'

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
	}),
})

export async function registerForPushNotifications(userId: string): Promise<string | null> {
	if (!Device.isDevice) {
		console.log('Push notifications require a physical device')
		return null
	}

	// Check / request permissions
	const { status: existing } = await Notifications.getPermissionsAsync()
	let finalStatus = existing
	if (existing !== 'granted') {
		const { status } = await Notifications.requestPermissionsAsync()
		finalStatus = status
	}
	if (finalStatus !== 'granted') {
		return null
	}

	// Android notification channel
	if (Platform.OS === 'android') {
		await Notifications.setNotificationChannelAsync('default', {
			name: 'Default',
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
		})
	}

	// Get Expo push token
	const projectId = Constants.expoConfig?.extra?.eas?.projectId
	const { data: token } = await Notifications.getExpoPushTokenAsync({
		projectId,
	})

	// Save to database
	await supabase.from('push_tokens').upsert(
		{
			user_id: userId,
			expo_token: token,
			platform: Platform.OS as 'ios' | 'android',
			is_active: true,
		},
		{ onConflict: 'user_id,expo_token' },
	)

	return token
}

export function addNotificationResponseListener(
	callback: (response: Notifications.NotificationResponse) => void,
) {
	return Notifications.addNotificationResponseReceivedListener(callback)
}
