import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from '../lib/auth-context'

export default function RootLayout() {
	return (
		<AuthProvider>
			<StatusBar style="dark" />
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="(tabs)" />
				<Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
				<Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
			</Stack>
		</AuthProvider>
	)
}
