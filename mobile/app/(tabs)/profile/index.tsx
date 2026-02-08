import { Ionicons } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AnimatedScreen } from '../../../components/animated-screen'
import { useAuth } from '../../../lib/auth-context'
import { supabase } from '../../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../../lib/theme'

export default function ProfileScreen() {
	const { user, profile, signOut } = useAuth()
	const router = useRouter()

	function handleSignOut() {
		Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
			{ text: 'Cancel', style: 'cancel' },
			{ text: 'Sign Out', style: 'destructive', onPress: signOut },
		])
	}

	const [isWorker, setIsWorker] = useState(false)

	useEffect(() => {
		if (!user) return
		async function checkWorker() {
			const { count } = await supabase
				.from('workers')
				.select('id', { count: 'exact', head: true })
				.eq('user_id', user!.id)
				.eq('is_active', true)
			setIsWorker((count ?? 0) > 0)
		}
		checkWorker()
	}, [user])

	if (!user) {
		return (
			<SafeAreaView style={styles.container} edges={['top']}>
				<View style={styles.header}>
					<Text style={styles.title}>Profile</Text>
				</View>
				<View style={styles.emptyState}>
					<Ionicons name="person-outline" size={48} color={colors.border} />
					<Text style={styles.emptyTitle}>Sign in to your account</Text>
					<Text style={styles.emptySubtitle}>
						Manage your profile, bookings, and preferences
					</Text>
					<Link href="/(auth)/login" asChild>
						<TouchableOpacity style={styles.signInBtn} activeOpacity={0.8}>
							<Text style={styles.signInBtnText}>Sign in</Text>
						</TouchableOpacity>
					</Link>
					<Link href="/(auth)/signup" asChild>
						<TouchableOpacity activeOpacity={0.7}>
							<Text style={styles.createAccountText}>Create an account</Text>
						</TouchableOpacity>
					</Link>
				</View>
			</SafeAreaView>
		)
	}

	return (
		<AnimatedScreen>
			<SafeAreaView style={styles.container} edges={['top']}>
				<View style={styles.header}>
					<Text style={styles.title}>Profile</Text>
				</View>

				{/* Avatar + Name */}
				<View style={styles.profileCard}>
					<View style={styles.avatar}>
						<Text style={styles.avatarText}>
							{(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
						</Text>
					</View>
					<View style={styles.profileInfo}>
						<Text style={styles.profileName}>{profile?.full_name || 'User'}</Text>
						<Text style={styles.profileEmail}>{user?.email}</Text>
						<View style={styles.roleRow}>
							<View style={styles.roleBadge}>
								<Text style={styles.roleText}>
									{profile?.role === 'business_owner' ? 'Business Owner' : isWorker ? 'Worker' : 'Client'}
								</Text>
							</View>
							{profile?.created_at && (
								<Text style={styles.memberSince}>
									Since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
								</Text>
							)}
						</View>
					</View>
				</View>

				{/* Menu items */}
				<View style={styles.menu}>
					<MenuItem
						icon="person-outline"
						label="Edit Profile"
						onPress={() => router.push('/(tabs)/profile/edit' as never)}
					/>
					{profile?.role === 'business_owner' && (
						<MenuItem
							icon="storefront-outline"
							label="My Business"
							onPress={() => router.push('/(tabs)/business' as never)}
						/>
					)}
					{isWorker && (
						<MenuItem
							icon="briefcase-outline"
							label="My Work"
							onPress={() => router.push('/(tabs)/my-work' as never)}
						/>
					)}
					<MenuItem icon="notifications-outline" label="Notifications" />
					<MenuItem icon="shield-checkmark-outline" label="Privacy & Security" />
					<MenuItem icon="help-circle-outline" label="Help & Support" />
				</View>

				<TouchableOpacity
					style={styles.signOutButton}
					onPress={handleSignOut}
					activeOpacity={0.7}
				>
					<Ionicons name="log-out-outline" size={20} color={colors.destructive} />
					<Text style={styles.signOutText}>Sign Out</Text>
				</TouchableOpacity>
			</SafeAreaView>
		</AnimatedScreen>
	)
}

function MenuItem({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void }) {
	return (
		<TouchableOpacity style={styles.menuItem} activeOpacity={0.6} onPress={onPress}>
			<View style={styles.menuItemLeft}>
				<Ionicons name={icon} size={20} color={colors.foregroundSecondary} />
				<Text style={styles.menuItemLabel}>{label}</Text>
			</View>
			<Ionicons name="chevron-forward" size={18} color={colors.border} />
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	header: {
		paddingHorizontal: spacing['2xl'],
		paddingTop: spacing.lg,
		paddingBottom: spacing.xl,
	},
	title: {
		fontSize: fontSize['2xl'],
		fontWeight: '700',
		color: colors.foreground,
		letterSpacing: -0.5,
	},
	emptyState: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		gap: spacing.md,
		paddingBottom: 100,
	},
	emptyTitle: {
		fontSize: fontSize.lg,
		fontWeight: '600',
		color: colors.foregroundSecondary,
	},
	emptySubtitle: {
		fontSize: fontSize.sm,
		color: colors.foregroundSecondary,
		textAlign: 'center',
		paddingHorizontal: spacing['4xl'],
	},
	signInBtn: {
		marginTop: spacing.md,
		paddingHorizontal: spacing['2xl'],
		paddingVertical: spacing.md,
		borderRadius: radius.md,
		backgroundColor: colors.primary,
	},
	signInBtnText: {
		fontSize: fontSize.sm,
		fontWeight: '600',
		color: colors.white,
	},
	createAccountText: {
		fontSize: fontSize.sm,
		fontWeight: '500',
		color: colors.primary,
		marginTop: spacing.sm,
	},
	profileCard: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.lg,
		marginHorizontal: spacing['2xl'],
		padding: spacing.xl,
		borderRadius: radius.lg,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		marginBottom: spacing['2xl'],
	},
	avatar: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: colors.primaryLight,
		justifyContent: 'center',
		alignItems: 'center',
	},
	avatarText: {
		fontSize: fontSize.xl,
		fontWeight: '700',
		color: colors.primary,
	},
	profileInfo: {
		flex: 1,
		gap: spacing.xs,
	},
	profileName: {
		fontSize: fontSize.lg,
		fontWeight: '600',
		color: colors.foreground,
	},
	profileEmail: {
		fontSize: fontSize.sm,
		color: colors.foregroundSecondary,
	},
	roleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
		marginTop: spacing.xs,
	},
	roleBadge: {
		paddingHorizontal: spacing.sm,
		paddingVertical: 2,
		borderRadius: radius.sm,
		backgroundColor: colors.primaryLight,
	},
	roleText: {
		fontSize: fontSize.xs,
		fontWeight: '500',
		color: colors.primary,
	},
	memberSince: {
		fontSize: fontSize.xs,
		color: colors.foregroundSecondary,
	},
	menu: {
		marginHorizontal: spacing['2xl'],
		borderRadius: radius.lg,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		overflow: 'hidden',
	},
	menuItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: spacing.lg,
		paddingHorizontal: spacing.xl,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	menuItemLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.md,
	},
	menuItemLabel: {
		fontSize: fontSize.base,
		color: colors.foreground,
	},
	signOutButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing.sm,
		marginHorizontal: spacing['2xl'],
		marginTop: spacing['2xl'],
		paddingVertical: spacing.lg,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.destructive + '30',
		backgroundColor: colors.destructiveLight,
	},
	signOutText: {
		fontSize: fontSize.base,
		fontWeight: '600',
		color: colors.destructive,
	},
})
