import { Ionicons } from '@expo/vector-icons'
import { Link, router } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
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
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated'
import { useAuth } from '../../lib/auth-context'
import { colors, fontSize, radius, spacing } from '../../lib/theme'

export default function LoginScreen() {
	const { sendOtp, verifyOtp } = useAuth()
	const [step, setStep] = useState<'phone' | 'otp'>('phone')
	const [phone, setPhone] = useState('')
	const [otpCode, setOtpCode] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [countdown, setCountdown] = useState(0)
	const otpInputRef = useRef<TextInput>(null)

	useEffect(() => {
		if (countdown <= 0) return
		const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
		return () => clearTimeout(timer)
	}, [countdown])

	useEffect(() => {
		if (step === 'otp') {
			setTimeout(() => otpInputRef.current?.focus(), 300)
		}
	}, [step])

	async function handleSendCode() {
		if (!phone.trim() || phone.trim().length < 10) {
			setError('Please enter a valid phone number')
			return
		}
		setError(null)
		setIsLoading(true)
		const result = await sendOtp(phone.trim())
		setIsLoading(false)
		if (result.error) {
			setError(result.error)
			return
		}
		setStep('otp')
		setCountdown(60)
	}

	async function handleVerifyCode() {
		if (otpCode.length !== 6) {
			setError('Please enter the 6-digit code')
			return
		}
		setError(null)
		setIsLoading(true)
		const result = await verifyOtp(phone.trim(), otpCode)
		if (result.error) {
			setError(result.error)
			setIsLoading(false)
		} else {
			router.replace('/')
		}
	}

	const handleResend = useCallback(async () => {
		if (countdown > 0) return
		setError(null)
		const result = await sendOtp(phone.trim())
		if (result.error) {
			setError(result.error)
			return
		}
		setCountdown(60)
	}, [countdown, phone, sendOtp])

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

				{step === 'phone' ? (
					<Animated.View entering={FadeIn.duration(300)}>
						<Text style={styles.title}>Welcome back</Text>
						<Text style={styles.subtitle}>Enter your phone number to sign in</Text>

						{error && (
							<Animated.View entering={FadeInDown.duration(200)} style={styles.errorBox}>
								<Text style={styles.errorText}>{error}</Text>
							</Animated.View>
						)}

						<View style={styles.form}>
							<View style={styles.field}>
								<Text style={styles.label}>Phone number</Text>
								<View style={styles.phoneInputContainer}>
									<Ionicons name="call-outline" size={18} color={colors.foregroundSecondary} style={styles.phoneIcon} />
									<TextInput
										style={[styles.input, styles.phoneInput]}
										placeholder="+1 (555) 000-0000"
										placeholderTextColor={colors.foregroundSecondary}
										value={phone}
										onChangeText={setPhone}
										keyboardType="phone-pad"
										autoComplete="tel"
										autoFocus
									/>
								</View>
							</View>

							<TouchableOpacity
								style={[styles.button, isLoading && styles.buttonDisabled]}
								onPress={handleSendCode}
								disabled={isLoading}
								activeOpacity={0.8}
							>
								{isLoading ? (
									<ActivityIndicator color={colors.white} size="small" />
								) : (
									<Text style={styles.buttonText}>Send Code</Text>
								)}
							</TouchableOpacity>
						</View>

						<View style={styles.footer}>
							<Text style={styles.footerText}>Don't have an account? </Text>
							<Link href="/(auth)/signup" asChild>
								<TouchableOpacity>
									<Text style={styles.footerLink}>Sign up</Text>
								</TouchableOpacity>
							</Link>
						</View>
					</Animated.View>
				) : (
					<Animated.View entering={FadeInRight.duration(300)}>
						<TouchableOpacity
							style={styles.backButton}
							onPress={() => { setStep('phone'); setError(null); setOtpCode('') }}
							activeOpacity={0.7}
						>
							<Ionicons name="arrow-back" size={18} color={colors.foregroundSecondary} />
							<Text style={styles.backText}>Back</Text>
						</TouchableOpacity>

						<View style={styles.otpHeader}>
							<Animated.View entering={FadeIn.delay(100).duration(300)} style={styles.shieldCircle}>
								<Ionicons name="shield-checkmark-outline" size={32} color={colors.primary} />
							</Animated.View>
							<Text style={styles.title}>Enter verification code</Text>
							<Text style={styles.subtitle}>
								We sent a 6-digit code to{' '}
								<Text style={styles.phoneHighlight}>{phone}</Text>
							</Text>
						</View>

						{error && (
							<Animated.View entering={FadeInDown.duration(200)} style={styles.errorBox}>
								<Text style={styles.errorText}>{error}</Text>
							</Animated.View>
						)}

						<View style={styles.form}>
							<View style={styles.field}>
								<Text style={styles.label}>Verification code</Text>
								<TextInput
									ref={otpInputRef}
									style={[styles.input, styles.otpInput]}
									placeholder="000000"
									placeholderTextColor={colors.foregroundSecondary}
									value={otpCode}
									onChangeText={(text) => setOtpCode(text.replace(/\D/g, '').slice(0, 6))}
									keyboardType="number-pad"
									maxLength={6}
									autoComplete="one-time-code"
								/>
							</View>

							<TouchableOpacity
								style={[styles.button, isLoading && styles.buttonDisabled]}
								onPress={handleVerifyCode}
								disabled={isLoading}
								activeOpacity={0.8}
							>
								{isLoading ? (
									<ActivityIndicator color={colors.white} size="small" />
								) : (
									<Text style={styles.buttonText}>Verify & Sign In</Text>
								)}
							</TouchableOpacity>
						</View>

						<View style={styles.resendContainer}>
							{countdown > 0 ? (
								<Text style={styles.resendText}>
									Resend code in <Text style={styles.countdownText}>{countdown}s</Text>
								</Text>
							) : (
								<TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
									<Text style={styles.resendLink}>Resend code</Text>
								</TouchableOpacity>
							)}
						</View>
					</Animated.View>
				)}
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
	phoneInputContainer: {
		position: 'relative',
	},
	phoneIcon: {
		position: 'absolute',
		left: spacing.lg,
		top: 14,
		zIndex: 1,
	},
	phoneInput: {
		paddingLeft: spacing.lg + 26,
	},
	otpInput: {
		textAlign: 'center',
		fontSize: fontSize['2xl'],
		letterSpacing: 12,
		fontVariant: ['tabular-nums'],
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
	backButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.xs,
		marginBottom: spacing.lg,
	},
	backText: {
		fontSize: fontSize.sm,
		color: colors.foregroundSecondary,
	},
	otpHeader: {
		alignItems: 'center',
		marginBottom: spacing.lg,
	},
	shieldCircle: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: colors.primaryLight,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: spacing.lg,
	},
	phoneHighlight: {
		fontWeight: '600',
		color: colors.foreground,
	},
	resendContainer: {
		alignItems: 'center',
		marginTop: spacing['2xl'],
	},
	resendText: {
		fontSize: fontSize.sm,
		color: colors.foregroundSecondary,
	},
	countdownText: {
		fontWeight: '600',
		color: colors.foreground,
	},
	resendLink: {
		fontSize: fontSize.sm,
		fontWeight: '600',
		color: colors.primary,
	},
})
