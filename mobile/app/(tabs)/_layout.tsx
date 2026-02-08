import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/auth-context'
import { supabase } from '../../lib/supabase'
import { colors } from '../../lib/theme'

export default function TabsLayout() {
	const { user, profile } = useAuth()
	const isBusinessOwner = profile?.role === 'business_owner' ||
		user?.user_metadata?.role === 'business_owner'
	const [isWorker, setIsWorker] = useState(false)

	useEffect(() => {
		if (!user) {
			setIsWorker(false)
			return
		}
		async function checkWorkerStatus() {
			const { count } = await supabase
				.from('workers')
				.select('id', { count: 'exact', head: true })
				.eq('user_id', user!.id)
				.eq('is_active', true)
			setIsWorker((count ?? 0) > 0)
		}
		checkWorkerStatus()
	}, [user])

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
				}}
			/>
			<Tabs.Screen
				name="favorites"
				options={{
					title: 'Favorites',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="heart-outline" size={size} color={color} />
					),
					href: isBusinessOwner ? null : '/(tabs)/favorites',
				}}
			/>
			<Tabs.Screen
				name="my-work"
				options={{
					title: 'My Work',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="briefcase-outline" size={size} color={color} />
					),
					href: user && isWorker ? '/(tabs)/my-work' : null,
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
				}}
			/>
			<Tabs.Screen
				name="edit-profile"
				options={{
					title: 'Edit Profile',
					headerShown: true,
					headerStyle: { backgroundColor: colors.background },
					headerTintColor: colors.foreground,
					headerTitleStyle: { fontWeight: '600' },
					headerShadowVisible: false,
					href: null,
				}}
			/>
		</Tabs>
	)
}
