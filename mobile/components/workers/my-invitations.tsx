import { Ionicons } from '@expo/vector-icons'
import React, { useCallback, useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { useAuth } from '../../lib/auth-context'
import { supabase } from '../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../lib/theme'

interface PendingInvitation {
	id: string
	business_id: string
	display_name: string
	bio: string | null
	specialties: string[] | null
	invited_by: string
	businesses: { name: string } | null
}

interface MyInvitationsProps {
	onAccepted?: () => void
}

export function MyInvitations({ onAccepted }: MyInvitationsProps) {
	const { user } = useAuth()
	const [invitations, setInvitations] = useState<PendingInvitation[]>([])
	const [loading, setLoading] = useState(true)
	const [responding, setResponding] = useState<string | null>(null)

	useEffect(() => {
		if (!user) return
		async function load() {
			const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user!.id).single()
			if (!profile) { setLoading(false); return }

			const { data } = await supabase
				.from('worker_invitations')
				.select('id, business_id, display_name, bio, specialties, invited_by, businesses(name)')
				.eq('phone', profile.phone)
				.eq('status', 'pending')

			setInvitations((data ?? []) as unknown as PendingInvitation[])
			setLoading(false)
		}
		load()
	}, [user])

	const handleRespond = useCallback(async (invitation: PendingInvitation, accept: boolean) => {
		if (!user) return
		setResponding(invitation.id)

		if (accept) {
			const { error } = await supabase.from('workers').insert({
				business_id: invitation.business_id,
				user_id: user.id,
				display_name: invitation.display_name,
				bio: invitation.bio || null,
				specialties: invitation.specialties,
				is_active: true,
			})

			if (error) {
				setResponding(null)
				Alert.alert('Error', error.message)
				return
			}

			await supabase.from('worker_invitations').update({
				status: 'accepted',
				accepted_at: new Date().toISOString(),
			}).eq('id', invitation.id)

			// Notify business owner
			const { data: biz } = await supabase.from('businesses').select('name').eq('id', invitation.business_id).single()
			await supabase.from('notifications').insert({
				user_id: invitation.invited_by,
				type: 'worker_invitation',
				title: 'Invitation accepted',
				message: `${invitation.display_name} accepted the invitation to join ${biz?.name ?? 'your business'}`,
				data: { business_id: invitation.business_id },
			})
		} else {
			await supabase.from('worker_invitations').update({
				status: 'declined',
			}).eq('id', invitation.id)

			const { data: biz } = await supabase.from('businesses').select('name').eq('id', invitation.business_id).single()
			await supabase.from('notifications').insert({
				user_id: invitation.invited_by,
				type: 'worker_invitation',
				title: 'Invitation declined',
				message: `${invitation.display_name} declined the invitation to join ${biz?.name ?? 'your business'}`,
				data: { business_id: invitation.business_id },
			})
		}

		setInvitations((prev) => prev.filter((i) => i.id !== invitation.id))
		setResponding(null)
		if (accept) onAccepted?.()
	}, [user, onAccepted])

	if (loading || invitations.length === 0) return null

	return (
		<View style={styles.container}>
			<Text style={styles.sectionTitle}>Pending Invitations</Text>
			{invitations.map((inv) => (
				<View key={inv.id} style={styles.card}>
					<View style={styles.iconContainer}>
						<Ionicons name="mail-outline" size={20} color={colors.warningDark} />
					</View>
					<View style={styles.info}>
						<Text style={styles.businessName}>{inv.businesses?.name ?? 'A business'}</Text>
						<Text style={styles.roleName}>Invited as {inv.display_name}</Text>
					</View>
					<View style={styles.actions}>
						<TouchableOpacity
							style={styles.declineBtn}
							onPress={() => handleRespond(inv, false)}
							disabled={responding === inv.id}
							activeOpacity={0.7}
						>
							{responding === inv.id ? (
								<ActivityIndicator size="small" color={colors.foregroundSecondary} />
							) : (
								<Ionicons name="close" size={18} color={colors.foregroundSecondary} />
							)}
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.acceptBtn}
							onPress={() => handleRespond(inv, true)}
							disabled={responding === inv.id}
							activeOpacity={0.7}
						>
							{responding === inv.id ? (
								<ActivityIndicator size="small" color={colors.white} />
							) : (
								<Ionicons name="checkmark" size={18} color={colors.white} />
							)}
						</TouchableOpacity>
					</View>
				</View>
			))}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: spacing['2xl'],
		marginBottom: spacing.xl,
	},
	sectionTitle: {
		fontSize: fontSize.base,
		fontWeight: '600',
		color: colors.foreground,
		marginBottom: spacing.md,
	},
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.surface,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.warningLight,
		padding: spacing.lg,
		gap: spacing.md,
		marginBottom: spacing.sm,
	},
	iconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: colors.warningLight,
		justifyContent: 'center',
		alignItems: 'center',
	},
	info: { flex: 1 },
	businessName: {
		fontSize: fontSize.sm,
		fontWeight: '600',
		color: colors.foreground,
	},
	roleName: {
		fontSize: fontSize.xs,
		color: colors.foregroundSecondary,
		marginTop: 1,
	},
	actions: {
		flexDirection: 'row',
		gap: spacing.sm,
	},
	declineBtn: {
		width: 34,
		height: 34,
		borderRadius: 17,
		borderWidth: 1,
		borderColor: colors.border,
		justifyContent: 'center',
		alignItems: 'center',
	},
	acceptBtn: {
		width: 34,
		height: 34,
		borderRadius: 17,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
})
