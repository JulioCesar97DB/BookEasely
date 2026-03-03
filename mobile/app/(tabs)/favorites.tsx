import { AnimatedScreen } from '../../components/animated-screen'
import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Dimensions,
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BusinessCard } from '../../components/business-card'
import { useAuth } from '../../lib/auth-context'
import { handleSupabaseError } from '../../lib/handle-error'
import { supabase } from '../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../lib/theme'
import type { BusinessWithCategory } from '../../lib/types'

export default function FavoritesScreen() {
	const { user } = useAuth()
	const [favorites, setFavorites] = useState<BusinessWithCategory[]>([])
	const [loading, setLoading] = useState(true)
	const [refreshing, setRefreshing] = useState(false)

	const fetchFavorites = useCallback(async () => {
		if (!user) return
		const { data, error } = await supabase
			.from('favorites')
			.select('id, businesses(*, categories(name, slug))')
			.eq('client_id', user.id)
			.order('created_at', { ascending: false })

		handleSupabaseError(error, 'Loading favorites')
		const businesses = (data ?? [])
			.map((f: any) => f.businesses)
			.filter(Boolean)
		setFavorites(businesses)
		setLoading(false)
		setRefreshing(false)
	}, [user])

	useEffect(() => { fetchFavorites() }, [fetchFavorites])

	const screenWidth = Dimensions.get('window').width
	const gridGap = spacing.sm
	const gridPadding = spacing['2xl']
	const cardWidth = (screenWidth - gridPadding * 2 - gridGap) / 2

	if (!user) {
		return (
			<AnimatedScreen>
				<SafeAreaView style={styles.container} edges={['top']}>
					<View style={styles.header}><Text style={styles.title}>Favorites</Text></View>
					<View style={styles.emptyState}>
						<Ionicons name="heart-outline" size={48} color={colors.border} />
						<Text style={styles.emptyTitle}>Sign in to save favorites</Text>
						<Text style={styles.emptySubtitle}>Save businesses you love for quick access later</Text>
						<Link href="/(auth)/login" asChild>
							<TouchableOpacity style={styles.signInBtn} activeOpacity={0.8}>
								<Text style={styles.signInBtnText}>Sign in</Text>
							</TouchableOpacity>
						</Link>
					</View>
				</SafeAreaView>
			</AnimatedScreen>
		)
	}

	return (
		<AnimatedScreen>
			<SafeAreaView style={styles.container} edges={['top']}>
				<View style={styles.header}><Text style={styles.title}>Favorites</Text></View>
				{loading ? (
					<View style={styles.emptyState}><ActivityIndicator size="large" color={colors.primary} /></View>
				) : favorites.length === 0 ? (
					<View style={styles.emptyState}>
						<Ionicons name="heart-outline" size={48} color={colors.border} />
						<Text style={styles.emptyTitle}>No favorites yet</Text>
						<Text style={styles.emptySubtitle}>Save businesses you love for quick access later</Text>
					</View>
				) : (
					<FlatList
						data={favorites}
						keyExtractor={(item) => item.id}
						numColumns={2}
						renderItem={({ item, index }) => {
							const isLeft = index % 2 === 0
							return (
								<View style={{ flex: 1, marginLeft: isLeft ? gridPadding : gridGap / 2, marginRight: isLeft ? gridGap / 2 : gridPadding, marginBottom: gridGap }}>
									<BusinessCard business={item} width={cardWidth} />
								</View>
							)
						}}
						contentContainerStyle={styles.listContent}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFavorites() }} tintColor={colors.primary} />}
					/>
				)}
			</SafeAreaView>
		</AnimatedScreen>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	header: { paddingHorizontal: spacing['2xl'], paddingTop: spacing.lg, paddingBottom: spacing.xl },
	title: { fontSize: fontSize['2xl'], fontWeight: '700', color: colors.foreground, letterSpacing: -0.5 },
	listContent: { paddingBottom: spacing['3xl'] },
	emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md, paddingBottom: 100 },
	emptyTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.foregroundSecondary },
	emptySubtitle: { fontSize: fontSize.sm, color: colors.foregroundSecondary, textAlign: 'center', paddingHorizontal: spacing['4xl'] },
	signInBtn: { marginTop: spacing.md, paddingHorizontal: spacing['2xl'], paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.primary },
	signInBtnText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.white },
})
