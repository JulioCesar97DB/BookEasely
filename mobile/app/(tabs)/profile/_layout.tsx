import { Stack } from 'expo-router'
import { colors } from '../../../lib/theme'

export default function ProfileLayout() {
	return (
		<Stack
			screenOptions={{
				headerStyle: { backgroundColor: colors.background },
				headerTintColor: colors.foreground,
				headerTitleStyle: { fontWeight: '600' },
				headerShadowVisible: false,
			}}
		>
			<Stack.Screen name="index" options={{ headerShown: false, title: 'Profile' }} />
			<Stack.Screen name="edit" options={{ title: 'Edit Profile' }} />
		</Stack>
	)
}
