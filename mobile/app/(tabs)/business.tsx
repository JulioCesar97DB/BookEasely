import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, fontSize, spacing } from '../../lib/theme'

export default function BusinessScreen() {
	return (
		<SafeAreaView style={styles.container} edges={['top']}>
			<View style={styles.header}>
				<Text style={styles.title}>My Business</Text>
			</View>
			<View style={styles.emptyState}>
				<Ionicons name="storefront-outline" size={48} color={colors.border} />
				<Text style={styles.emptyTitle}>Business dashboard</Text>
				<Text style={styles.emptySubtitle}>
					Manage your bookings, services, and workers here
				</Text>
			</View>
		</SafeAreaView>
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
})
