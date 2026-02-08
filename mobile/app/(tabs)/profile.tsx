import { Ionicons } from '@expo/vector-icons'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../lib/auth-context'
import { colors, fontSize, radius, spacing } from '../../lib/theme'

export default function ProfileScreen() {
	const { user, profile, signOut } = useAuth()

	function handleSignOut() {
		Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
			{ text: 'Cancel', style: 'cancel' },
			{ text: 'Sign Out', style: 'destructive', onPress: signOut },
		])
	}

	return (
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
					<View style={styles.roleBadge}>
						<Text style={styles.roleText}>
							{profile?.role === 'business_owner' ? 'Business Owner' : 'Client'}
						</Text>
					</View>
				</View>
			</View>

			{/* Menu items */}
			<View style={styles.menu}>
				<MenuItem icon="person-outline" label="Edit Profile" />
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
	)
}

function MenuItem({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
	return (
		<TouchableOpacity style={styles.menuItem} activeOpacity={0.6}>
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
	roleBadge: {
		alignSelf: 'flex-start',
		paddingHorizontal: spacing.sm,
		paddingVertical: 2,
		borderRadius: radius.sm,
		backgroundColor: colors.primaryLight,
		marginTop: spacing.xs,
	},
	roleText: {
		fontSize: fontSize.xs,
		fontWeight: '500',
		color: colors.primary,
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
