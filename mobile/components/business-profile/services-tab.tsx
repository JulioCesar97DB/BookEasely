import { Ionicons } from '@expo/vector-icons'
import { Image, StyleSheet, Text, View } from 'react-native'
import { formatDuration, getInitials } from '../../lib/format'
import { colors, fontSize, radius, spacing } from '../../lib/theme'
import type { Service, Worker } from '../../lib/types'

interface ServicesSectionProps {
	services: Service[]
	serviceWorkerMap: Map<string, string[]>
	workersById: Map<string, Worker>
}

export function ServicesSection({ services, serviceWorkerMap, workersById }: ServicesSectionProps) {
	if (services.length === 0) {
		return (
			<View style={styles.emptyState}>
				<Ionicons name="list-outline" size={36} color={colors.border} />
				<Text style={styles.emptyTitle}>No services listed</Text>
			</View>
		)
	}

	return (
		<View style={styles.sectionList}>
			{services.map((service) => {
				const workerIds = serviceWorkerMap.get(service.id) ?? []
				const assigned = workerIds.map((id) => workersById.get(id)).filter(Boolean) as Worker[]

				return (
					<View key={service.id} style={styles.serviceCard}>
						<View style={styles.serviceMain}>
							<View style={styles.serviceInfo}>
								<Text style={styles.serviceName}>{service.name}</Text>
								{service.description && (
									<Text style={styles.serviceDesc} numberOfLines={2}>
										{service.description}
									</Text>
								)}
								<View style={styles.serviceMeta}>
									<Ionicons name="time-outline" size={12} color={colors.foregroundSecondary} />
									<Text style={styles.serviceMetaText}>
										{formatDuration(service.duration_minutes)}
									</Text>
									{assigned.length > 0 && (
										<>
											<Text style={styles.serviceMetaText}> · </Text>
											<View style={styles.avatarGroup}>
												{assigned.slice(0, 3).map((w) => (
													<View key={w.id} style={styles.miniAvatar}>
														{w.avatar_url ? (
															<Image source={{ uri: w.avatar_url }} style={styles.miniAvatarImg} />
														) : (
															<Text style={styles.miniAvatarText}>{getInitials(w.display_name)[0]}</Text>
														)}
													</View>
												))}
											</View>
										</>
									)}
								</View>
							</View>
							<Text style={styles.servicePrice}>${Number(service.price).toFixed(0)}</Text>
						</View>
					</View>
				)
			})}
		</View>
	)
}

const styles = StyleSheet.create({
	sectionList: { gap: spacing.md },
	serviceCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
	serviceMain: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
	serviceInfo: { flex: 1 },
	serviceName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.foreground },
	serviceDesc: { fontSize: fontSize.xs, color: colors.foregroundSecondary, marginTop: 2, lineHeight: 18 },
	serviceMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
	serviceMetaText: { fontSize: fontSize.xs, color: colors.foregroundSecondary },
	servicePrice: { fontSize: fontSize.sm, fontWeight: '600', color: colors.foreground },
	avatarGroup: { flexDirection: 'row' },
	miniAvatar: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: colors.surface, marginLeft: -4 },
	miniAvatarImg: { width: 18, height: 18, borderRadius: 9 },
	miniAvatarText: { fontSize: 8, fontWeight: '600', color: colors.foregroundSecondary },
	emptyState: { alignItems: 'center', paddingVertical: spacing['5xl'], gap: spacing.sm },
	emptyTitle: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foregroundSecondary },
})
