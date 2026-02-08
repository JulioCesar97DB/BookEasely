import { Stack } from 'expo-router'
import { colors } from '../../../lib/theme'

export default function BusinessLayout() {
	return (
		<Stack
			screenOptions={{
				headerStyle: { backgroundColor: colors.background },
				headerTintColor: colors.foreground,
				headerTitleStyle: { fontWeight: '600' },
				headerShadowVisible: false,
				contentStyle: { backgroundColor: colors.background },
			}}
		>
			<Stack.Screen name="index" options={{ headerShown: false, title: 'Business' }} />
			<Stack.Screen name="profile" options={{ title: 'Edit Profile' }} />
			<Stack.Screen name="services" options={{ title: 'Services' }} />
			<Stack.Screen name="add-service" options={{ title: 'Add Service' }} />
			<Stack.Screen name="workers" options={{ title: 'Team' }} />
			<Stack.Screen name="add-worker" options={{ title: 'Invite Worker' }} />
			<Stack.Screen name="hours" options={{ title: 'Business Hours' }} />
			<Stack.Screen name="worker-availability" options={{ title: 'Worker Schedule' }} />
			<Stack.Screen name="worker-blocked-dates" options={{ title: 'Time Off' }} />
			<Stack.Screen name="schedule" options={{ title: 'Schedule' }} />
			<Stack.Screen name="settings" options={{ title: 'Business Settings' }} />
		</Stack>
	)
}
