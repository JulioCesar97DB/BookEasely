import { Ionicons } from '@expo/vector-icons'
import { Image, StyleSheet, Text, View } from 'react-native'
import { getInitials } from '../../lib/format'
import { colors, fontSize, radius, spacing } from '../../lib/theme'
import type { Service, Worker } from '../../lib/types'

interface WorkersSectionProps {
	workers: Worker[]
	workerServiceMap: Map<string, string[]>
	servicesById: Map<string, Service>
}

export function WorkersSection({ workers, workerServiceMap, servicesById }: WorkersSectionProps) {
	if (workers.length === 0) {
		return (
			<View style={styles.emptyState}>
				<Ionicons name="people-outline" size={36} color={colors.border} />
				<Text style={styles.emptyTitle}>No team members</Text>
			</View>
		)
	}

	return (
		<View style={styles.sectionList}>
			{workers.map((worker) => {
				const serviceIds = workerServiceMap.get(worker.id) ?? []
				const assigned = serviceIds.map((id) => servicesById.get(id)).filter(Boolean) as Service[]

				return (
					<View key={worker.id} style={styles.workerCard}>
						<View style={styles.workerHeader}>
							<View style={styles.workerAvatar}>
								{worker.avatar_url ? (
									<Image source={{ uri: worker.avatar_url }} style={styles.workerAvatarImg} />
								) : (
									<Text style={styles.workerAvatarText}>{getInitials(worker.display_name)}</Text>
								)}
							</View>
							<View style={styles.workerInfo}>
								<Text style={styles.workerName}>{worker.display_name}</Text>
								{worker.bio && (
									<Text style={styles.workerBio} numberOfLines={2}>{worker.bio}</Text>
								)}
							</View>
						</View>

						{worker.specialties && worker.specialties.length > 0 && (
							<View style={styles.specialties}>
								{worker.specialties.map((s) => (
									<View key={s} style={styles.specialtyBadge}>
										<Text style={styles.specialtyText}>{s}</Text>
									</View>
								))}
							</View>
						)}

						{assigned.length > 0 && (
							<View style={styles.workerServices}>
								<Text style={styles.workerServicesLabel}>SERVICES</Text>
								<Text style={styles.workerServicesList} numberOfLines={2}>
									{assigned.map((s) => s.name).join(', ')}
								</Text>
							</View>
						)}
					</View>
				)
			})}
		</View>
	)
}

const styles = StyleSheet.create({
	sectionList: { gap: spacing.md },
	workerCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
	workerHeader: { flexDirection: 'row', gap: spacing.md },
	workerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center' },
	workerAvatarImg: { width: 44, height: 44, borderRadius: 22 },
	workerAvatarText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.foregroundSecondary },
	workerInfo: { flex: 1 },
	workerName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.foreground },
	workerBio: { fontSize: fontSize.xs, color: colors.foregroundSecondary, marginTop: 2, lineHeight: 18 },
	specialties: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md },
	specialtyBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.surfaceSecondary },
	specialtyText: { fontSize: 10, fontWeight: '500', color: colors.foregroundSecondary },
	workerServices: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
	workerServicesLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, color: colors.foregroundSecondary, marginBottom: 4 },
	workerServicesList: { fontSize: fontSize.xs, color: colors.foregroundSecondary, lineHeight: 18 },
	emptyState: { alignItems: 'center', paddingVertical: spacing['5xl'], gap: spacing.sm },
	emptyTitle: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foregroundSecondary },
})
