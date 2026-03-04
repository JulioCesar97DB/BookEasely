import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors, fontSize, radius, spacing } from '../../lib/theme'
import type { WorkerInvitation } from '../../lib/types'

interface InvitationCardProps {
	invitation: WorkerInvitation
	onCancel: (id: string) => void
}

export const InvitationCard = React.memo(function InvitationCard({ invitation, onCancel }: InvitationCardProps) {
	return (
		<View style={styles.invitationCard}>
			<View style={styles.invitationIcon}>
				<Ionicons name="mail-outline" size={18} color={colors.warningDark} />
			</View>
			<View style={styles.invitationBody}>
				<Text style={styles.invitationName}>{invitation.display_name}</Text>
				<Text style={styles.invitationEmail}>{invitation.phone}</Text>
			</View>
			<TouchableOpacity
				onPress={() => onCancel(invitation.id)}
				activeOpacity={0.6}
				style={styles.cancelButton}
			>
				<Ionicons name="close" size={18} color={colors.foregroundSecondary} />
			</TouchableOpacity>
		</View>
	)
})

const styles = StyleSheet.create({
	invitationCard: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: spacing.lg,
		backgroundColor: colors.surface,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		gap: spacing.md,
	},
	invitationIcon: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: colors.warningLight,
		justifyContent: 'center',
		alignItems: 'center',
	},
	invitationBody: { flex: 1 },
	invitationName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.foreground },
	invitationEmail: { fontSize: fontSize.xs, color: colors.foregroundSecondary, marginTop: 1 },
	cancelButton: { padding: spacing.sm },
})
