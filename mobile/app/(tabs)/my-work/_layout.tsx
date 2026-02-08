import { Stack } from 'expo-router'
import { colors } from '../../../lib/theme'

export default function MyWorkLayout() {
	return (
		<Stack
			screenOptions={{
				headerStyle: { backgroundColor: colors.background },
				headerTintColor: colors.foreground,
				headerTitleStyle: { fontWeight: '600' },
				headerShadowVisible: false,
			}}
		>
			<Stack.Screen name="index" options={{ headerShown: false, title: 'My Work' }} />
			<Stack.Screen name="schedule" options={{ title: 'My Schedule' }} />
			<Stack.Screen name="blocked-dates" options={{ title: 'Time Off' }} />
			<Stack.Screen name="appointments" options={{ title: 'Appointments' }} />
		</Stack>
	)
}
