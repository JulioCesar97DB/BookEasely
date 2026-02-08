import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { useAuth } from '../../../lib/auth-context'
import { supabase } from '../../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../../lib/theme'
import type { Service } from '../../../lib/types'

export default function ServicesScreen() {
	const { user } = useAuth()
	const router = useRouter()
	const [services, setServices] = useState<Service[]>([])
	const [loading, setLoading] = useState(true)
	const [businessId, setBusinessId] = useState<string | null>(null)

	useEffect(() => {
		if (!user) return
		async function load() {
			const { data: biz } = await supabase
				.from('businesses')
				.select('id')
				.eq('owner_id', user!.id)
				.single()
			if (biz) {
				setBusinessId(biz.id)
				const { data } = await supabase
					.from('services')
					.select('*')
					.eq('business_id', biz.id)
					.order('created_at')
				setServices(data ?? [])
			}
			setLoading(false)
		}
		load()
	}, [user])

	async function handleDelete(id: string) {
		Alert.alert('Delete Service', 'Are you sure you want to delete this service?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: async () => {
					const { error } = await supabase.from('services').delete().eq('id', id)
					if (error) {
						Alert.alert('Error', error.message)
					} else {
						setServices((prev) => prev.filter((s) => s.id !== id))
					}
				},
			},
		])
	}

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color={colors.primary} />
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<FlatList
				data={services}
				keyExtractor={(item) => item.id}
				contentContainerStyle={services.length === 0 ? styles.emptyContainer : styles.list}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<Ionicons name="clipboard-outline" size={48} color={colors.border} />
						<Text style={styles.emptyTitle}>No services yet</Text>
						<Text style={styles.emptySubtitle}>Add your first service to start accepting bookings</Text>
						<TouchableOpacity
							style={styles.addButton}
							onPress={() => router.push('/(tabs)/business/add-service')}
							activeOpacity={0.8}
						>
							<Ionicons name="add" size={18} color={colors.white} />
							<Text style={styles.addButtonText}>Add Service</Text>
						</TouchableOpacity>
					</View>
				}
				renderItem={({ item }) => (
					<View style={styles.card}>
						<View style={styles.cardBody}>
							<View style={styles.cardHeader}>
								<Text style={styles.cardName}>{item.name}</Text>
								<View style={[styles.badge, item.is_active ? styles.badgeActive : styles.badgeInactive]}>
									<Text style={[styles.badgeText, item.is_active ? styles.badgeTextActive : styles.badgeTextInactive]}>
										{item.is_active ? 'Active' : 'Inactive'}
									</Text>
								</View>
							</View>
							{item.description && (
								<Text style={styles.cardDescription} numberOfLines={2}>
									{item.description}
								</Text>
							)}
							<View style={styles.cardMeta}>
								<Text style={styles.cardPrice}>${item.price.toFixed(2)}</Text>
								<Text style={styles.cardDuration}>{item.duration_minutes} min</Text>
							</View>
						</View>
						<View style={styles.cardActions}>
							<TouchableOpacity
								onPress={() => router.push(`/(tabs)/business/add-service?id=${item.id}` as never)}
								style={styles.iconButton}
								activeOpacity={0.7}
							>
								<Ionicons name="pencil-outline" size={18} color={colors.primary} />
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => handleDelete(item.id)}
								style={styles.iconButton}
								activeOpacity={0.7}
							>
								<Ionicons name="trash-outline" size={18} color={colors.destructive} />
							</TouchableOpacity>
						</View>
					</View>
				)}
			/>

			{services.length > 0 && (
				<TouchableOpacity
					style={styles.fab}
					onPress={() => router.push('/(tabs)/business/add-service')}
					activeOpacity={0.8}
				>
					<Ionicons name="add" size={24} color={colors.white} />
				</TouchableOpacity>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	list: { padding: spacing['2xl'], gap: spacing.md },
	emptyContainer: { flex: 1 },
	emptyState: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		gap: spacing.md,
		paddingBottom: 80,
	},
	emptyTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.foregroundSecondary },
	emptySubtitle: { fontSize: fontSize.sm, color: colors.foregroundSecondary, textAlign: 'center', paddingHorizontal: spacing['4xl'] },
	addButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
		backgroundColor: colors.primary,
		paddingHorizontal: spacing.xl,
		paddingVertical: spacing.md,
		borderRadius: radius.md,
		marginTop: spacing.md,
	},
	addButtonText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.white },
	card: {
		flexDirection: 'row',
		backgroundColor: colors.surface,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		padding: spacing.lg,
	},
	cardBody: { flex: 1, gap: spacing.xs },
	cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
	cardName: { fontSize: fontSize.base, fontWeight: '600', color: colors.foreground, flex: 1 },
	cardDescription: { fontSize: fontSize.sm, color: colors.foregroundSecondary },
	cardMeta: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xs },
	cardPrice: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
	cardDuration: { fontSize: fontSize.sm, color: colors.foregroundSecondary },
	badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
	badgeActive: { backgroundColor: '#E9F9EF' },
	badgeInactive: { backgroundColor: colors.surfaceSecondary },
	badgeText: { fontSize: 10, fontWeight: '600' },
	badgeTextActive: { color: '#30A46C' },
	badgeTextInactive: { color: colors.foregroundSecondary },
	cardActions: { justifyContent: 'center', gap: spacing.md },
	iconButton: { padding: spacing.xs },
	fab: {
		position: 'absolute',
		bottom: spacing['2xl'],
		right: spacing['2xl'],
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 8,
	},
})
