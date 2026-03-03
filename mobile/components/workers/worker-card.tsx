import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { DAYS_SHORT } from '../../lib/constants'
import { colors, fontSize, radius, spacing } from '../../lib/theme'
import type { Worker, WorkerAvailability } from '../../lib/types'

function getAvailabilitySummary(workerAvail: WorkerAvailability[]): string {
	const activeDays = workerAvail.filter((a) => a.is_active).sort((a, b) => a.day_of_week - b.day_of_week)
	if (activeDays.length === 0) return 'No schedule set'

	const times = activeDays[0]
	const timeStr = times ? `${times.start_time.slice(0, 5)}–${times.end_time.slice(0, 5)}` : ''
	const indices = activeDays.map((d) => d.day_of_week)

	if (indices.length >= 2) {
		const first = indices[0]!
		const last = indices[indices.length - 1]!
		const isConsecutive = indices.every((v, i) => v === first + i)
		if (isConsecutive) return `${DAYS_SHORT[first]}–${DAYS_SHORT[last]}, ${timeStr}`
	}
	return `${activeDays.length} days/week, ${timeStr}`
}

interface WorkerCardProps {
	worker: Worker
	availability: WorkerAvailability[]
	serviceCount: number
	businessId: string | null
}

export const WorkerCard = React.memo(function WorkerCard({ worker, availability, serviceCount, businessId }: WorkerCardProps) {
	const router = useRouter()
	const workerAvail = availability.filter((a) => a.worker_id === worker.id)
	const availSummary = getAvailabilitySummary(workerAvail)

	return (
		<View style={styles.card}>
			<TouchableOpacity
				style={styles.cardMain}
				onPress={() => router.push(`/(tabs)/business/add-worker?id=${worker.id}&businessId=${businessId}` as `/${string}`)}
				activeOpacity={0.7}
			>
				<View style={styles.avatar}>
					<Text style={styles.avatarText}>{worker.display_name.charAt(0).toUpperCase()}</Text>
				</View>
				<View style={styles.cardBody}>
					<View style={styles.cardNameRow}>
						<Text style={styles.cardName}>{worker.display_name}</Text>
						<View style={[styles.statusDot, worker.is_active ? styles.statusActive : styles.statusInactive]} />
					</View>
					{worker.bio && (
						<Text style={styles.cardBio} numberOfLines={1}>{worker.bio}</Text>
					)}
					<View style={styles.statsRow}>
						<View style={styles.statPill}>
							<Ionicons name="clipboard-outline" size={11} color={colors.foregroundSecondary} />
							<Text style={styles.statText}>{serviceCount} service{serviceCount !== 1 ? 's' : ''}</Text>
						</View>
						<View style={styles.statPill}>
							<Ionicons name="time-outline" size={11} color={colors.foregroundSecondary} />
							<Text style={styles.statText}>{availSummary}</Text>
						</View>
					</View>
					{worker.specialties && worker.specialties.length > 0 && (
						<View style={styles.specialtiesRow}>
							{worker.specialties.slice(0, 3).map((spec) => (
								<View key={spec} style={styles.specBadge}>
									<Text style={styles.specText}>{spec}</Text>
								</View>
							))}
						</View>
					)}
					<Text style={styles.memberSince}>
						Since {new Date(worker.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
					</Text>
				</View>
			</TouchableOpacity>
			<View style={styles.cardActions}>
				<TouchableOpacity
					style={styles.actionButton}
					onPress={() => router.push(`/(tabs)/business/worker-availability?workerId=${worker.id}&workerName=${encodeURIComponent(worker.display_name)}` as `/${string}`)}
					activeOpacity={0.7}
				>
					<Ionicons name="time-outline" size={15} color={colors.primary} />
					<Text style={styles.actionText}>Schedule</Text>
				</TouchableOpacity>
				<View style={styles.actionDivider} />
				<TouchableOpacity
					style={styles.actionButton}
					onPress={() => router.push(`/(tabs)/business/worker-blocked-dates?workerId=${worker.id}&workerName=${encodeURIComponent(worker.display_name)}` as `/${string}`)}
					activeOpacity={0.7}
				>
					<Ionicons name="calendar-outline" size={15} color={colors.primary} />
					<Text style={styles.actionText}>Time Off</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
})

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.surface,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		overflow: 'hidden',
	},
	cardMain: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		padding: spacing.lg,
		gap: spacing.md,
	},
	avatar: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: colors.primaryLight,
		justifyContent: 'center',
		alignItems: 'center',
	},
	avatarText: { fontSize: fontSize.base, fontWeight: '600', color: colors.primary },
	cardBody: { flex: 1 },
	cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
	cardName: { fontSize: fontSize.base, fontWeight: '600', color: colors.foreground },
	cardBio: { fontSize: fontSize.sm, color: colors.foregroundSecondary, marginTop: 2 },
	statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
	statPill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
		paddingHorizontal: spacing.sm,
		paddingVertical: 2,
		borderRadius: radius.full,
		backgroundColor: colors.background,
	},
	statText: { fontSize: 10, color: colors.foregroundSecondary },
	specialtiesRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm, flexWrap: 'wrap' },
	specBadge: {
		paddingHorizontal: spacing.sm,
		paddingVertical: 2,
		borderRadius: radius.full,
		borderWidth: 1,
		borderColor: colors.border,
	},
	specText: { fontSize: 10, color: colors.foregroundSecondary },
	memberSince: { fontSize: 10, color: colors.foregroundSecondary, marginTop: spacing.sm, opacity: 0.6 },
	statusDot: { width: 8, height: 8, borderRadius: 4 },
	statusActive: { backgroundColor: '#30A46C' },
	statusInactive: { backgroundColor: colors.border },
	cardActions: {
		flexDirection: 'row',
		borderTopWidth: 1,
		borderTopColor: colors.border,
	},
	actionButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing.xs,
		paddingVertical: spacing.sm,
	},
	actionDivider: {
		width: 1,
		backgroundColor: colors.border,
	},
	actionText: { fontSize: fontSize.xs, fontWeight: '500', color: colors.primary },
})
