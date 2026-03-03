import { Ionicons } from '@expo/vector-icons'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { getInitials } from '../../lib/format'
import { colors, fontSize, radius, spacing } from '../../lib/theme'
import type { Service, Worker } from '../../lib/types'

interface WorkerStepProps {
	selectedService: Service
	availableWorkers: Worker[]
	onSelectWorker: (worker: Worker) => void
	onSelectAny: () => void
}

export function WorkerStep({ selectedService, availableWorkers, onSelectWorker, onSelectAny }: WorkerStepProps) {
	return (
		<>
			<Text style={styles.stepTitle}>Select a Professional</Text>
			<Text style={styles.stepSubtitle}>For: {selectedService.name}</Text>
			{availableWorkers.length >= 2 && (
				<TouchableOpacity
					style={styles.optionCard}
					activeOpacity={0.7}
					onPress={onSelectAny}
				>
					<View style={styles.workerRow}>
						<View style={[styles.workerAvatar, { backgroundColor: colors.primaryLight }]}>
							<Ionicons name="shuffle" size={20} color={colors.primary} />
						</View>
						<View style={styles.optionInfo}>
							<Text style={styles.optionName}>Any available professional</Text>
							<Text style={styles.optionDesc}>We'll find the best time for you</Text>
						</View>
					</View>
				</TouchableOpacity>
			)}
			{availableWorkers.map((worker) => (
				<TouchableOpacity
					key={worker.id}
					style={styles.optionCard}
					activeOpacity={0.7}
					onPress={() => onSelectWorker(worker)}
				>
					<View style={styles.workerRow}>
						<View style={styles.workerAvatar}>
							{worker.avatar_url ? (
								<Image source={{ uri: worker.avatar_url }} style={styles.workerAvatarImg} />
							) : (
								<Text style={styles.workerAvatarText}>{getInitials(worker.display_name)}</Text>
							)}
						</View>
						<View style={styles.optionInfo}>
							<Text style={styles.optionName}>{worker.display_name}</Text>
							{worker.bio && <Text style={styles.optionDesc} numberOfLines={1}>{worker.bio}</Text>}
						</View>
					</View>
				</TouchableOpacity>
			))}
		</>
	)
}

const styles = StyleSheet.create({
	stepTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.foreground, marginBottom: spacing.sm },
	stepSubtitle: { fontSize: fontSize.sm, color: colors.foregroundSecondary, marginBottom: spacing.lg },
	optionCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	optionInfo: { flex: 1 },
	optionName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.foreground },
	optionDesc: { fontSize: fontSize.xs, color: colors.foregroundSecondary, marginTop: 2 },
	workerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
	workerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center' },
	workerAvatarImg: { width: 40, height: 40, borderRadius: 20 },
	workerAvatarText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.foregroundSecondary },
})
