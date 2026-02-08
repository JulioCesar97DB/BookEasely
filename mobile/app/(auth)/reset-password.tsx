import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { useAuth } from '../../lib/auth-context'
import { colors, fontSize, radius, spacing } from '../../lib/theme'

export default function ResetPasswordScreen() {
	const { resetPassword } = useAuth()
	const [email, setEmail] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	async function handleReset() {
		if (!email.trim()) {
			setError('Please enter your email')
			return
		}
		setError(null)
		setIsLoading(true)
		const result = await resetPassword(email.trim())
		setIsLoading(false)
		if (result.error) {
			setError(result.error)
		} else {
			setSuccess(true)
		}
	}

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<View style={styles.content}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => router.back()}
					activeOpacity={0.7}
				>
					<Ionicons name="arrow-back" size={20} color={colors.foregroundSecondary} />
					<Text style={styles.backText}>Back to login</Text>
				</TouchableOpacity>

				<Text style={styles.title}>Reset password</Text>
				<Text style={styles.subtitle}>
					Enter your email and we'll send you a link to reset your password
				</Text>

				{error && (
					<View style={styles.errorBox}>
						<Text style={styles.errorText}>{error}</Text>
					</View>
				)}

				{success ? (
					<View style={styles.successCard}>
						<View style={styles.successIcon}>
							<Ionicons name="mail-outline" size={28} color={colors.primary} />
						</View>
						<Text style={styles.successTitle}>Check your email</Text>
						<Text style={styles.successText}>
							We've sent you a password reset link. Please check your inbox.
						</Text>
						<TouchableOpacity
							style={styles.outlineButton}
							onPress={() => router.replace('/(auth)/login')}
							activeOpacity={0.8}
						>
							<Text style={styles.outlineButtonText}>Back to login</Text>
						</TouchableOpacity>
					</View>
				) : (
					<View style={styles.form}>
						<View style={styles.field}>
							<Text style={styles.label}>Email</Text>
							<TextInput
								style={styles.input}
								placeholder="you@example.com"
								placeholderTextColor={colors.foregroundSecondary}
								value={email}
								onChangeText={setEmail}
								keyboardType="email-address"
								autoCapitalize="none"
								autoComplete="email"
							/>
						</View>

						<TouchableOpacity
							style={[styles.button, isLoading && styles.buttonDisabled]}
							onPress={handleReset}
							disabled={isLoading}
							activeOpacity={0.8}
						>
							{isLoading ? (
								<ActivityIndicator color={colors.white} size="small" />
							) : (
								<Text style={styles.buttonText}>Send reset link</Text>
							)}
						</TouchableOpacity>
					</View>
				)}
			</View>
		</KeyboardAvoidingView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	content: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: spacing['2xl'],
	},
	backButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.xs,
		marginBottom: spacing['3xl'],
	},
	backText: {
		fontSize: fontSize.sm,
		color: colors.foregroundSecondary,
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
		marginTop: spacing.xs,
		marginBottom: spacing['3xl'],
		lineHeight: 20,
	},
	errorBox: {
		backgroundColor: colors.destructiveLight,
		borderRadius: radius.md,
		padding: spacing.lg,
		marginBottom: spacing.lg,
		borderWidth: 1,
		borderColor: colors.destructive + '30',
	},
	errorText: {
		fontSize: fontSize.sm,
		color: colors.destructive,
	},
	successCard: {
		alignItems: 'center',
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.lg,
		backgroundColor: colors.surface,
		padding: spacing['3xl'],
		gap: spacing.md,
	},
	successIcon: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: colors.primaryLight,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: spacing.sm,
	},
	successTitle: {
		fontSize: fontSize.lg,
		fontWeight: '600',
		color: colors.foreground,
	},
	successText: {
		fontSize: fontSize.sm,
		color: colors.foregroundSecondary,
		textAlign: 'center',
		lineHeight: 20,
	},
	outlineButton: {
		height: 44,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: spacing['2xl'],
		marginTop: spacing.sm,
		width: '100%',
	},
	outlineButtonText: {
		fontSize: fontSize.sm,
		fontWeight: '600',
		color: colors.foreground,
	},
	form: {
		gap: spacing.lg,
	},
	field: {
		gap: spacing.sm,
	},
	label: {
		fontSize: fontSize.sm,
		fontWeight: '500',
		color: colors.foreground,
	},
	input: {
		height: 48,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.md,
		paddingHorizontal: spacing.lg,
		fontSize: fontSize.base,
		color: colors.foreground,
		backgroundColor: colors.surface,
	},
	button: {
		height: 48,
		borderRadius: radius.md,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
	buttonDisabled: {
		opacity: 0.7,
	},
	buttonText: {
		fontSize: fontSize.base,
		fontWeight: '600',
		color: colors.white,
	},
})
