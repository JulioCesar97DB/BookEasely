import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { useAuth } from '../lib/auth-context'
import { colors } from '../lib/theme'

export default function Index() {
	const { isLoading, user, profile } = useAuth()

	if (isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
				<ActivityIndicator size="large" color={colors.primary} />
			</View>
		)
	}

	// Not logged in → discovery tabs (public)
	if (!user) {
		return <Redirect href="/(tabs)" />
	}

	// Logged in but onboarding not complete
	// profile is always defined for logged-in users (auth-context builds fallback)
	if (!profile?.onboarding_completed) {
		return <Redirect href="/onboarding" />
	}

	// Logged in + onboarding complete → tabs
	return <Redirect href="/(tabs)" />
}
