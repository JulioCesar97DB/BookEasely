import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { formatDuration } from '../../lib/format'
import { colors, fontSize, radius, spacing } from '../../lib/theme'
import type { Service } from '../../lib/types'

interface ServiceStepProps {
	services: Service[]
	onSelect: (service: Service) => void
}

export function ServiceStep({ services, onSelect }: ServiceStepProps) {
	return (
		<>
			<Text style={styles.stepTitle}>Select a Service</Text>
			{services.map((service) => (
				<TouchableOpacity
					key={service.id}
					style={styles.optionCard}
					activeOpacity={0.7}
					onPress={() => onSelect(service)}
				>
					<View style={styles.optionInfo}>
						<Text style={styles.optionName}>{service.name}</Text>
						{service.description && <Text style={styles.optionDesc} numberOfLines={1}>{service.description}</Text>}
						<View style={styles.optionMeta}>
							<Ionicons name="time-outline" size={12} color={colors.foregroundSecondary} />
							<Text style={styles.optionMetaText}>{formatDuration(service.duration_minutes)}</Text>
						</View>
					</View>
					<Text style={styles.optionPrice}>${Number(service.price).toFixed(0)}</Text>
				</TouchableOpacity>
			))}
		</>
	)
}

const styles = StyleSheet.create({
	stepTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.foreground, marginBottom: spacing.sm },
	optionCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	optionInfo: { flex: 1 },
	optionName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.foreground },
	optionDesc: { fontSize: fontSize.xs, color: colors.foregroundSecondary, marginTop: 2 },
	optionMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
	optionMetaText: { fontSize: fontSize.xs, color: colors.foregroundSecondary },
	optionPrice: { fontSize: fontSize.base, fontWeight: '600', color: colors.foreground, marginLeft: spacing.md },
})
