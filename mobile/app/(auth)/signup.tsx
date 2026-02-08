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

export default function SignUpScreen() {
	const { signUp } = useAuth()
	const [fullName, setFullName] = useState('')
	const [email, setEmail] = useState('')
	const [phone, setPhone] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [role, setRole] = useState<'client' | 'business_owner'>('client')
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	async function handleSignUp() {
		if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
			setError('Please fill in all fields')
			return
		}
		if (phone.trim().length < 10) {
			setError('Please enter a valid phone number')
			return
		}
		if (password.length < 8) {
			setError('Password must be at least 8 characters')
			return
		}
		if (password !== confirmPassword) {
			setError('Passwords do not match')
			return
		}

		setError(null)
		setIsLoading(true)
		const result = await signUp(email.trim(), password, {
			full_name: fullName.trim(),
			phone: phone.trim(),
			role,
		})
		if (result.error) {
			setError(result.error)
			setIsLoading(false)
		} else {
			router.replace('/(auth)/verify')
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

				<Text style={styles.title}>Create an account</Text>
				<Text style={styles.subtitle}>Get started with BookEasely today</Text>

				{error && (
					<View style={styles.errorBox}>
						<Text style={styles.errorText}>{error}</Text>
					</View>
				)}

				{/* Role selector */}
				<View style={styles.roleContainer}>
					<Text style={styles.label}>I want to</Text>
					<View style={styles.roleRow}>
						<TouchableOpacity
							style={[styles.roleCard, role === 'client' && styles.roleCardActive]}
							onPress={() => setRole('client')}
							activeOpacity={0.7}
						>
							<Ionicons
								name="person-outline"
								size={20}
								color={role === 'client' ? colors.primary : colors.foregroundSecondary}
							/>
							<Text style={[styles.roleText, role === 'client' && styles.roleTextActive]}>
								Book services
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.roleCard, role === 'business_owner' && styles.roleCardActive]}
							onPress={() => setRole('business_owner')}
							activeOpacity={0.7}
						>
							<Ionicons
								name="briefcase-outline"
								size={20}
								color={role === 'business_owner' ? colors.primary : colors.foregroundSecondary}
							/>
							<Text style={[styles.roleText, role === 'business_owner' && styles.roleTextActive]}>
								List my business
							</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Form */}
				<View style={styles.form}>
					<View style={styles.field}>
						<Text style={styles.label}>Full name</Text>
						<TextInput
							style={styles.input}
							placeholder="John Doe"
							placeholderTextColor={colors.foregroundSecondary}
							value={fullName}
							onChangeText={setFullName}
							autoComplete="name"
						/>
					</View>

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
						<Text style={styles.label}>Phone number</Text>
						<TextInput
							style={styles.input}
							placeholder="+1 (555) 000-0000"
							placeholderTextColor={colors.foregroundSecondary}
							value={phone}
							onChangeText={setPhone}
							keyboardType="phone-pad"
							autoComplete="tel"
						/>
					</View>

					<View style={styles.field}>
						<Text style={styles.label}>Password</Text>
						<View style={styles.passwordContainer}>
							<TextInput
								style={[styles.input, styles.passwordInput]}
								placeholder="At least 8 characters"
								placeholderTextColor={colors.foregroundSecondary}
								value={password}
								onChangeText={setPassword}
								secureTextEntry={!showPassword}
								autoComplete="new-password"
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

					<View style={styles.field}>
						<Text style={styles.label}>Confirm password</Text>
						<TextInput
							style={styles.input}
							placeholder="Re-enter your password"
							placeholderTextColor={colors.foregroundSecondary}
							value={confirmPassword}
							onChangeText={setConfirmPassword}
							secureTextEntry={!showPassword}
							autoComplete="new-password"
						/>
					</View>

					<TouchableOpacity
						style={[styles.button, isLoading && styles.buttonDisabled]}
						onPress={handleSignUp}
						disabled={isLoading}
						activeOpacity={0.8}
					>
						{isLoading ? (
							<ActivityIndicator color={colors.white} size="small" />
						) : (
							<Text style={styles.buttonText}>Create account</Text>
						)}
					</TouchableOpacity>
				</View>

				<View style={styles.footer}>
					<Text style={styles.footerText}>Already have an account? </Text>
					<Link href="/(auth)/login" asChild>
						<TouchableOpacity>
							<Text style={styles.footerLink}>Sign in</Text>
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
		paddingHorizontal: spacing['2xl'],
		paddingTop: spacing['5xl'] + 20,
		paddingBottom: spacing['5xl'],
	},
	logoContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
		marginBottom: spacing['3xl'],
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
		marginBottom: spacing['2xl'],
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
	roleContainer: {
		gap: spacing.sm,
		marginBottom: spacing.lg,
	},
	roleRow: {
		flexDirection: 'row',
		gap: spacing.md,
	},
	roleCard: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		gap: spacing.sm,
		paddingVertical: spacing.lg,
		borderRadius: radius.lg,
		borderWidth: 2,
		borderColor: colors.border,
		backgroundColor: colors.surface,
	},
	roleCardActive: {
		borderColor: colors.primary,
		backgroundColor: colors.primaryLight,
	},
	roleText: {
		fontSize: fontSize.sm,
		fontWeight: '500',
		color: colors.foreground,
	},
	roleTextActive: {
		color: colors.primary,
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
