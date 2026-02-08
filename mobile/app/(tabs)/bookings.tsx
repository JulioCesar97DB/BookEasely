import { AnimatedScreen } from '../../components/animated-screen'
import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../lib/auth-context'
import { colors, fontSize, radius, spacing } from '../../lib/theme'

export default function BookingsScreen() {
	const { user } = useAuth()

	return (
		<AnimatedScreen>
			<SafeAreaView style={styles.container} edges={['top']}>
				<View style={styles.header}>
					<Text style={styles.title}>My Bookings</Text>
				</View>
				{!user ? (
					<View style={styles.emptyState}>
						<Ionicons name="calendar-outline" size={48} color={colors.border} />
						<Text style={styles.emptyTitle}>Sign in to see your bookings</Text>
						<Text style={styles.emptySubtitle}>
							Track your upcoming and past appointments
						</Text>
						<Link href="/(auth)/login" asChild>
							<TouchableOpacity style={styles.signInBtn} activeOpacity={0.8}>
								<Text style={styles.signInBtnText}>Sign in</Text>
							</TouchableOpacity>
						</Link>
					</View>
				) : (
					<View style={styles.emptyState}>
						<Ionicons name="calendar-outline" size={48} color={colors.border} />
						<Text style={styles.emptyTitle}>No bookings yet</Text>
						<Text style={styles.emptySubtitle}>
							Your upcoming and past bookings will appear here
						</Text>
					</View>
				)}
			</SafeAreaView>
		</AnimatedScreen>
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
})
