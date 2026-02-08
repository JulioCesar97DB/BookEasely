import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
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
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import { colors, fontSize, radius, spacing } from '../lib/theme'

export default function OnboardingScreen() {
	const { user, profile, refreshProfile } = useAuth()
	const isBusinessOwner = profile?.role === 'business_owner'

	const [step, setStep] = useState(0)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Profile fields
	const [fullName, setFullName] = useState(profile?.full_name || '')
	const [phone, setPhone] = useState(profile?.phone || '')

	// Business fields
	const [businessName, setBusinessName] = useState('')
	const [businessAddress, setBusinessAddress] = useState('')
	const [businessCity, setBusinessCity] = useState('')
	const [businessState, setBusinessState] = useState('')
	const [businessZip, setBusinessZip] = useState('')

	async function handleCompleteProfile() {
		if (!fullName.trim() || !phone.trim()) {
			setError('Please fill in all fields')
			return
		}
		setIsLoading(true)
		setError(null)

		const { error: err } = await supabase
			.from('profiles')
			.update({
				full_name: fullName.trim(),
				phone: phone.trim(),
				onboarding_completed: !isBusinessOwner,
			})
			.eq('id', user!.id)

		if (err) {
			setError(err.message)
			setIsLoading(false)
			return
		}

		if (isBusinessOwner) {
			setStep(1)
			setIsLoading(false)
		} else {
			await refreshProfile()
			router.replace('/(tabs)')
		}
	}

	async function handleCompleteBusiness() {
		if (!businessName.trim()) {
			setError('Please enter your business name')
			return
		}
		setIsLoading(true)
		setError(null)

		const slug = businessName
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '')
			+ '-' + Date.now().toString(36)

		const { error: bizErr } = await supabase.from('businesses').insert({
			owner_id: user!.id,
			name: businessName.trim(),
			slug,
			address: businessAddress.trim(),
			city: businessCity.trim(),
			state: businessState.trim(),
			zip_code: businessZip.trim(),
			phone: phone.trim(),
		})

		if (bizErr) {
			setError(bizErr.message)
			setIsLoading(false)
			return
		}

		await supabase
			.from('profiles')
			.update({ onboarding_completed: true })
			.eq('id', user!.id)

		await refreshProfile()
		router.replace('/(tabs)')
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

				{step === 0 ? (
					<>
						<View style={styles.stepIcon}>
							<Ionicons name="person-outline" size={28} color={colors.primary} />
						</View>
						<Text style={styles.title}>Complete your profile</Text>
						<Text style={styles.subtitle}>Tell us a bit about yourself to get started</Text>

						{error && (
							<View style={styles.errorBox}>
								<Text style={styles.errorText}>{error}</Text>
							</View>
						)}

						<View style={styles.form}>
							<View style={styles.field}>
								<Text style={styles.label}>Full name</Text>
								<TextInput
									style={styles.input}
									value={fullName}
									onChangeText={setFullName}
									placeholder="John Doe"
									placeholderTextColor={colors.foregroundSecondary}
									autoComplete="name"
								/>
							</View>

							<View style={styles.field}>
								<Text style={styles.label}>Phone number</Text>
								<TextInput
									style={styles.input}
									value={phone}
									onChangeText={setPhone}
									placeholder="+1 (555) 000-0000"
									placeholderTextColor={colors.foregroundSecondary}
									keyboardType="phone-pad"
									autoComplete="tel"
								/>
							</View>

							<TouchableOpacity
								style={[styles.button, isLoading && styles.buttonDisabled]}
								onPress={handleCompleteProfile}
								disabled={isLoading}
								activeOpacity={0.8}
							>
								{isLoading ? (
									<ActivityIndicator color={colors.white} size="small" />
								) : (
									<>
										<Text style={styles.buttonText}>Continue</Text>
										<Ionicons name="arrow-forward" size={16} color={colors.white} />
									</>
								)}
							</TouchableOpacity>
						</View>
					</>
				) : (
					<>
						<View style={styles.stepIcon}>
							<Ionicons name="storefront-outline" size={28} color={colors.primary} />
						</View>
						<Text style={styles.title}>Set up your business</Text>
						<Text style={styles.subtitle}>Add your business details to start receiving bookings</Text>

						{error && (
							<View style={styles.errorBox}>
								<Text style={styles.errorText}>{error}</Text>
							</View>
						)}

						<View style={styles.form}>
							<View style={styles.field}>
								<Text style={styles.label}>Business name</Text>
								<TextInput
									style={styles.input}
									value={businessName}
									onChangeText={setBusinessName}
									placeholder="My Business"
									placeholderTextColor={colors.foregroundSecondary}
								/>
							</View>

							<View style={styles.field}>
								<Text style={styles.label}>Address</Text>
								<TextInput
									style={styles.input}
									value={businessAddress}
									onChangeText={setBusinessAddress}
									placeholder="123 Main St"
									placeholderTextColor={colors.foregroundSecondary}
								/>
							</View>

							<View style={styles.fieldRow}>
								<View style={[styles.field, { flex: 2 }]}>
									<Text style={styles.label}>City</Text>
									<TextInput
										style={styles.input}
										value={businessCity}
										onChangeText={setBusinessCity}
										placeholder="City"
										placeholderTextColor={colors.foregroundSecondary}
									/>
								</View>
								<View style={[styles.field, { flex: 1 }]}>
									<Text style={styles.label}>State</Text>
									<TextInput
										style={styles.input}
										value={businessState}
										onChangeText={setBusinessState}
										placeholder="CA"
										placeholderTextColor={colors.foregroundSecondary}
									/>
								</View>
								<View style={[styles.field, { flex: 1 }]}>
									<Text style={styles.label}>ZIP</Text>
									<TextInput
										style={styles.input}
										value={businessZip}
										onChangeText={setBusinessZip}
										placeholder="90210"
										placeholderTextColor={colors.foregroundSecondary}
										keyboardType="number-pad"
									/>
								</View>
							</View>

							<View style={styles.buttonRow}>
								<TouchableOpacity
									style={styles.outlineButton}
									onPress={() => { setStep(0); setError(null) }}
									activeOpacity={0.7}
								>
									<Text style={styles.outlineButtonText}>Back</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[styles.button, styles.buttonFlex, isLoading && styles.buttonDisabled]}
									onPress={handleCompleteBusiness}
									disabled={isLoading}
									activeOpacity={0.8}
								>
									{isLoading ? (
										<ActivityIndicator color={colors.white} size="small" />
									) : (
										<>
											<Text style={styles.buttonText}>Finish setup</Text>
											<Ionicons name="checkmark" size={16} color={colors.white} />
										</>
									)}
								</TouchableOpacity>
							</View>
						</View>
					</>
				)}

				{/* Step indicator */}
				{isBusinessOwner && (
					<View style={styles.stepIndicator}>
						<View style={[styles.dot, step === 0 ? styles.dotActive : styles.dotInactive]} />
						<View style={[styles.dot, step === 1 ? styles.dotActive : styles.dotInactive]} />
					</View>
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
		justifyContent: 'center',
		gap: spacing.sm,
		marginBottom: spacing['4xl'],
	},
	logoIcon: {
		width: 44,
		height: 44,
		borderRadius: radius.lg,
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
	stepIcon: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: colors.primaryLight,
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'center',
		marginBottom: spacing.lg,
	},
	title: {
		fontSize: fontSize['2xl'],
		fontWeight: '700',
		color: colors.foreground,
		textAlign: 'center',
		letterSpacing: -0.5,
	},
	subtitle: {
		fontSize: fontSize.sm,
		color: colors.foregroundSecondary,
		textAlign: 'center',
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
	form: {
		gap: spacing.lg,
	},
	field: {
		gap: spacing.sm,
	},
	fieldRow: {
		flexDirection: 'row',
		gap: spacing.md,
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
		flexDirection: 'row',
		height: 48,
		borderRadius: radius.md,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		gap: spacing.sm,
		marginTop: spacing.sm,
	},
	buttonFlex: {
		flex: 1,
	},
	buttonDisabled: {
		opacity: 0.7,
	},
	buttonText: {
		fontSize: fontSize.base,
		fontWeight: '600',
		color: colors.white,
	},
	buttonRow: {
		flexDirection: 'row',
		gap: spacing.md,
		marginTop: spacing.sm,
	},
	outlineButton: {
		flex: 1,
		height: 48,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		justifyContent: 'center',
		alignItems: 'center',
	},
	outlineButtonText: {
		fontSize: fontSize.base,
		fontWeight: '600',
		color: colors.foreground,
	},
	stepIndicator: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: spacing.sm,
		marginTop: spacing['3xl'],
	},
	dot: {
		borderRadius: 4,
	},
	dotActive: {
		width: 32,
		height: 6,
		backgroundColor: colors.primary,
	},
	dotInactive: {
		width: 6,
		height: 6,
		backgroundColor: colors.border,
	},
})
