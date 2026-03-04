import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors, fontSize, radius, spacing } from '../../lib/theme'

export default function VerifyScreen() {
	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<View style={styles.iconCircle}>
					<Ionicons name="call-outline" size={36} color={colors.primary} />
				</View>

				<Text style={styles.title}>Verification sent</Text>
				<Text style={styles.subtitle}>
					Please go back to the login or signup screen to enter your verification code.
				</Text>

				<TouchableOpacity
					style={styles.outlineButton}
					onPress={() => router.replace('/(auth)/login')}
					activeOpacity={0.8}
				>
					<Text style={styles.outlineButtonText}>Go to login</Text>
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
