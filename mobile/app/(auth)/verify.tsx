import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors, fontSize, radius, spacing } from '../../lib/theme'

export default function VerifyScreen() {
	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<View style={styles.iconCircle}>
					<Ionicons name="mail-outline" size={36} color={colors.primary} />
				</View>

				<Text style={styles.title}>Check your email</Text>
				<Text style={styles.subtitle}>
					We've sent you a verification link. Please check your inbox and click the link to verify your account.
				</Text>

				<View style={styles.infoBox}>
					<Text style={styles.infoText}>
						Didn't receive the email? Check your spam folder or try signing up again with a different email.
					</Text>
				</View>

				<TouchableOpacity
					style={styles.outlineButton}
					onPress={() => router.replace('/(auth)/login')}
					activeOpacity={0.8}
				>
					<Text style={styles.outlineButtonText}>Back to login</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
		justifyContent: 'center',
		paddingHorizontal: spacing['2xl'],
	},
	content: {
		alignItems: 'center',
		gap: spacing.lg,
	},
	iconCircle: {
		width: 72,
		height: 72,
		borderRadius: 36,
		backgroundColor: colors.primaryLight,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: spacing.sm,
	},
	title: {
		fontSize: fontSize['2xl'],
		fontWeight: '700',
		color: colors.foreground,
		letterSpacing: -0.5,
	},
	subtitle: {
		fontSize: fontSize.sm,
		color: colors.foregroundSecondary,
		textAlign: 'center',
		lineHeight: 22,
		paddingHorizontal: spacing.lg,
	},
	infoBox: {
		backgroundColor: colors.surfaceSecondary,
		borderRadius: radius.md,
		padding: spacing.lg,
		marginTop: spacing.sm,
		width: '100%',
	},
	infoText: {
		fontSize: fontSize.xs,
		color: colors.foregroundSecondary,
		textAlign: 'center',
		lineHeight: 18,
	},
	outlineButton: {
		height: 48,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
		marginTop: spacing.sm,
	},
	outlineButtonText: {
		fontSize: fontSize.base,
		fontWeight: '600',
		color: colors.foreground,
	},
})
