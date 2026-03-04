import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	StyleSheet,
	Switch,
	Text,
	View,
} from 'react-native'
import { useAuth } from '../../../lib/auth-context'
import { supabase } from '../../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../../lib/theme'

interface Prefs {
	sms_enabled: boolean
	push_enabled: boolean
	reminder_enabled: boolean
}

const defaultPrefs: Prefs = {
	sms_enabled: true,
	push_enabled: true,
	reminder_enabled: true,
}

export default function NotificationSettingsScreen() {
	const { user } = useAuth()
	const [prefs, setPrefs] = useState<Prefs>(defaultPrefs)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		if (!user) return
		async function load() {
			const { data } = await supabase
				.from('notification_preferences')
				.select('sms_enabled, push_enabled, reminder_enabled')
				.eq('user_id', user!.id)
				.single()
			if (data) setPrefs(data)
			setLoading(false)
		}
		load()
	}, [user])

	async function handleToggle(key: keyof Prefs, value: boolean) {
		if (!user) return
		const updated = { ...prefs, [key]: value }
		setPrefs(updated)
		setSaving(true)

		const { error } = await supabase
			.from('notification_preferences')
			.upsert({
				user_id: user.id,
				...updated,
				updated_at: new Date().toISOString(),
			}, { onConflict: 'user_id' })

		setSaving(false)
		if (error) {
			setPrefs(prefs)
			Alert.alert('Error', error.message)
		}
	}

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={colors.primary} />
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Notification Channels</Text>

				<ToggleRow
					icon="chatbubble-outline"
					title="SMS notifications"
					description="Receive booking updates via text message"
					value={prefs.sms_enabled}
					onToggle={(v) => handleToggle('sms_enabled', v)}
					disabled={saving}
				/>

				<ToggleRow
					icon="phone-portrait-outline"
					title="Push notifications"
					description="Receive push notifications on this device"
					value={prefs.push_enabled}
					onToggle={(v) => handleToggle('push_enabled', v)}
					disabled={saving}
				/>

				<ToggleRow
					icon="alarm-outline"
					title="Booking reminders"
					description="Get reminded 24 hours before appointments"
					value={prefs.reminder_enabled}
					onToggle={(v) => handleToggle('reminder_enabled', v)}
					disabled={saving}
				/>
			</View>
		</View>
	)
}

function ToggleRow({
	icon,
	title,
	description,
	value,
	onToggle,
	disabled,
}: {
	icon: keyof typeof Ionicons.glyphMap
	title: string
	description: string
	value: boolean
	onToggle: (val: boolean) => void
	disabled?: boolean
}) {
	return (
		<View style={styles.row}>
			<Ionicons name={icon} size={20} color={colors.foregroundSecondary} />
			<View style={styles.rowText}>
				<Text style={styles.rowTitle}>{title}</Text>
				<Text style={styles.rowDescription}>{description}</Text>
			</View>
			<Switch
				value={value}
				onValueChange={onToggle}
				disabled={disabled}
				trackColor={{ false: colors.border, true: colors.primary }}
				thumbColor={colors.white}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
		padding: spacing['2xl'],
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.background,
	},
	section: {
		gap: spacing.sm,
	},
	sectionTitle: {
		fontSize: fontSize.base,
		fontWeight: '600',
		color: colors.foreground,
		marginBottom: spacing.sm,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.md,
		padding: spacing.lg,
		borderRadius: radius.md,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
	},
	rowText: {
		flex: 1,
	},
	rowTitle: {
		fontSize: fontSize.sm,
		fontWeight: '500',
		color: colors.foreground,
	},
	rowDescription: {
		fontSize: fontSize.xs,
		color: colors.foregroundSecondary,
		marginTop: 2,
	},
})
