import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useAuth } from '../../lib/auth-context'
import { colors } from '../../lib/theme'

export default function TabsLayout() {
	const { user, profile } = useAuth()
	const isBusinessOwner = profile?.role === 'business_owner'

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: colors.primary,
				tabBarInactiveTintColor: colors.foregroundSecondary,
				tabBarStyle: {
					backgroundColor: colors.surface,
					borderTopColor: colors.border,
					height: 85,
					paddingTop: 8,
					paddingBottom: 28,
				},
				tabBarLabelStyle: {
					fontSize: 11,
					fontWeight: '500',
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Discover',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="search" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="bookings"
				options={{
					title: 'Bookings',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="calendar-outline" size={size} color={color} />
					),
					href: user ? '/(tabs)/bookings' : null,
				}}
			/>
			<Tabs.Screen
				name="favorites"
				options={{
					title: 'Favorites',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="heart-outline" size={size} color={color} />
					),
					href: user && !isBusinessOwner ? '/(tabs)/favorites' : null,
				}}
			/>
			<Tabs.Screen
				name="business"
				options={{
					title: 'Business',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="storefront-outline" size={size} color={color} />
					),
					href: user && isBusinessOwner ? '/(tabs)/business' : null,
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: 'Profile',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="person-outline" size={size} color={color} />
					),
					href: user ? '/(tabs)/profile' : null,
				}}
			/>
		</Tabs>
	)
}
