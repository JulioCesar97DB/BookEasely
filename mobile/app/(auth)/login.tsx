import { Ionicons } from '@expo/vector-icons'
import { Link, router } from 'expo-router'
import { useState } from 'react'
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { useAuth } from '../../lib/auth-context'
import { colors, fontSize, radius, spacing } from '../../lib/theme'

export default function LoginScreen() {
	const { signIn } = useAuth()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	async function handleSignIn() {
		if (!email.trim() || !password.trim()) {
			setError('Please fill in all fields')
			return
		}
		setError(null)
		setIsLoading(true)
		const result = await signIn(email.trim(), password)
		if (result.error) {
			setError(result.error)
			setIsLoading(false)
		} else {
			router.replace('/')
		}
	}

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<ScrollView
				contentContainerStyle={styles.scroll}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				{/* Logo */}
				<View style={styles.logoContainer}>
					<View style={styles.logoIcon}>
						<Ionicons name="calendar" size={24} color={colors.white} />
					</View>
					<Text style={styles.logoText}>BookEasely</Text>
				</View>

				{/* Header */}
				<Text style={styles.title}>Welcome back</Text>
				<Text style={styles.subtitle}>Sign in to your account to continue</Text>

				{error && (
					<View style={styles.errorBox}>
						<Text style={styles.errorText}>{error}</Text>
					</View>
				)}

				{/* Form */}
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

					<View style={styles.field}>
						<View style={styles.labelRow}>
							<Text style={styles.label}>Password</Text>
							<Link href="/(auth)/reset-password" asChild>
								<TouchableOpacity>
									<Text style={styles.forgotLink}>Forgot password?</Text>
								</TouchableOpacity>
							</Link>
						</View>
						<View style={styles.passwordContainer}>
							<TextInput
								style={[styles.input, styles.passwordInput]}
								placeholder="Enter your password"
								placeholderTextColor={colors.foregroundSecondary}
								value={password}
								onChangeText={setPassword}
								secureTextEntry={!showPassword}
								autoComplete="current-password"
							/>
							<TouchableOpacity
								style={styles.eyeButton}
								onPress={() => setShowPassword(!showPassword)}
							>
								<Ionicons
									name={showPassword ? 'eye-off-outline' : 'eye-outline'}
									size={20}
									color={colors.foregroundSecondary}
								/>
							</TouchableOpacity>
						</View>
					</View>

					<TouchableOpacity
						style={[styles.button, isLoading && styles.buttonDisabled]}
						onPress={handleSignIn}
						disabled={isLoading}
						activeOpacity={0.8}
					>
						{isLoading ? (
							<ActivityIndicator color={colors.white} size="small" />
						) : (
							<Text style={styles.buttonText}>Sign In</Text>
						)}
					</TouchableOpacity>
				</View>

				{/* Footer */}
				<View style={styles.footer}>
					<Text style={styles.footerText}>Don't have an account? </Text>
					<Link href="/(auth)/signup" asChild>
						<TouchableOpacity>
							<Text style={styles.footerLink}>Sign up</Text>
						</TouchableOpacity>
					</Link>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	scroll: {
		flexGrow: 1,
		justifyContent: 'center',
		paddingHorizontal: spacing['2xl'],
		paddingVertical: spacing['5xl'],
	},
	logoContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
		marginBottom: spacing['4xl'],
	},
	logoIcon: {
		width: 40,
		height: 40,
		borderRadius: radius.md,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
	logoText: {
		fontSize: fontSize.xl,
		fontWeight: '700',
		color: colors.foreground,
		letterSpacing: -0.5,
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
	labelRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	forgotLink: {
		fontSize: fontSize.xs,
		fontWeight: '500',
		color: colors.primary,
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
	passwordContainer: {
		position: 'relative',
	},
	passwordInput: {
		paddingRight: 48,
	},
	eyeButton: {
		position: 'absolute',
		right: 0,
		top: 0,
		height: 48,
		width: 48,
		justifyContent: 'center',
		alignItems: 'center',
	},
	button: {
		height: 48,
		borderRadius: radius.md,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: spacing.sm,
	},
	buttonDisabled: {
		opacity: 0.7,
	},
	buttonText: {
		fontSize: fontSize.base,
		fontWeight: '600',
		color: colors.white,
	},
	footer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: spacing['3xl'],
	},
	footerText: {
		fontSize: fontSize.sm,
		color: colors.foregroundSecondary,
	},
	footerLink: {
		fontSize: fontSize.sm,
		fontWeight: '600',
		color: colors.primary,
	},
})
