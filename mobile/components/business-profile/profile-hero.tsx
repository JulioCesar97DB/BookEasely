import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import {
	Dimensions,
	Linking,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BusinessImageCarousel } from '../business-image-carousel'
import { isOpenNow } from '../../lib/format'
import { colors, fontSize, radius, spacing } from '../../lib/theme'
import type { BusinessHours, BusinessWithCategory } from '../../lib/types'

const screenWidth = Dimensions.get('window').width

const TABS = ['Services', 'Team', 'Reviews', 'Hours'] as const
type Tab = (typeof TABS)[number]

interface ProfileHeroProps {
	business: BusinessWithCategory
	hours: BusinessHours[]
	images: string[]
	activeTab: Tab
	onTabChange: (tab: Tab) => void
}

export function ProfileHero({ business, hours, images, activeTab, onTabChange }: ProfileHeroProps) {
	const router = useRouter()
	const location = [business.city, business.state].filter(Boolean).join(', ')
	const open = isOpenNow(hours)

	return (
		<>
			{/* Hero Image */}
			<View style={styles.heroContainer}>
				<BusinessImageCarousel images={images} height={200} width={screenWidth} />
				<View style={styles.heroOverlay} pointerEvents="none" />

				{/* Back button */}
				<SafeAreaView style={styles.heroNav} edges={['top']} pointerEvents="box-none">
					<TouchableOpacity
						style={styles.heroNavButton}
						onPress={() => router.back()}
						activeOpacity={0.7}
					>
						<Ionicons name="chevron-back" size={22} color="#fff" />
					</TouchableOpacity>
				</SafeAreaView>

				{/* Hero info */}
				<View style={styles.heroInfo} pointerEvents="none">
					{business.categories?.name && (
						<View style={styles.categoryBadge}>
							<Text style={styles.categoryBadgeText}>{business.categories.name}</Text>
						</View>
					)}
					<Text style={styles.heroName}>{business.name}</Text>
					<View style={styles.heroMeta}>
						{business.rating_count > 0 ? (
							<View style={styles.ratingRow}>
								<Ionicons name="star" size={14} color={colors.star} />
								<Text style={styles.heroRating}>
									{Number(business.rating_avg).toFixed(1)}
								</Text>
								<Text style={styles.heroRatingCount}>
									({business.rating_count})
								</Text>
							</View>
						) : (
							<Text style={styles.heroNoReviews}>No reviews yet</Text>
						)}
						{location && (
							<>
								<Text style={styles.heroDivider}>|</Text>
								<View style={styles.heroLocationRow}>
									<Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.9)" />
									<Text style={styles.heroLocation}>{location}</Text>
								</View>
							</>
						)}
					</View>
				</View>
			</View>

			{/* Info Bar */}
			<View style={styles.infoBar}>
				<View style={styles.infoRow}>
					{business.phone && (
						<TouchableOpacity
							style={styles.infoItem}
							onPress={() => Linking.openURL(`tel:${business.phone}`)}
						>
							<Ionicons name="call-outline" size={14} color={colors.foregroundSecondary} />
							<Text style={styles.infoText}>{business.phone}</Text>
						</TouchableOpacity>
					)}
					<View style={[styles.statusBadge, open ? styles.statusOpen : styles.statusClosed]}>
						<Text style={[styles.statusText, open ? styles.statusTextOpen : styles.statusTextClosed]}>
							{open ? 'Open' : 'Closed'}
						</Text>
					</View>
					{business.auto_confirm && (
						<View style={styles.instantBadge}>
							<Ionicons name="flash-outline" size={11} color={colors.primary} />
							<Text style={styles.instantText}>Instant</Text>
						</View>
					)}
				</View>
			</View>

			{/* Description */}
			{business.description && (
				<View style={styles.descriptionSection}>
					<Text style={styles.descriptionText}>{business.description}</Text>
				</View>
			)}

			{/* Tabs */}
			<View style={styles.tabsContainer}>
				<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
					{TABS.map((tab) => (
						<TouchableOpacity
							key={tab}
							style={[styles.tab, activeTab === tab && styles.tabActive]}
							onPress={() => onTabChange(tab)}
							activeOpacity={0.7}
						>
							<Ionicons
								name={
									tab === 'Services' ? 'list-outline' :
										tab === 'Team' ? 'people-outline' :
											tab === 'Reviews' ? 'star-outline' :
												'time-outline'
								}
								size={16}
								color={activeTab === tab ? colors.primary : colors.foregroundSecondary}
							/>
							<Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
								{tab}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>
		</>
	)
}

export { TABS }
export type { Tab }

const styles = StyleSheet.create({
	heroContainer: { position: 'relative' },
	heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
	heroNav: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: spacing.lg },
	heroNavButton: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
	heroInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg },
	categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: spacing.xs },
	categoryBadgeText: { fontSize: fontSize.xs, color: '#fff', fontWeight: '500' },
	heroName: { fontSize: fontSize['2xl'], fontWeight: '700', color: '#fff', letterSpacing: -0.5 },
	heroMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
	ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
	heroRating: { fontSize: fontSize.sm, fontWeight: '600', color: '#fff' },
	heroRatingCount: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.6)' },
	heroNoReviews: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.6)' },
	heroDivider: { color: 'rgba(255,255,255,0.3)', fontSize: fontSize.sm },
	heroLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
	heroLocation: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.9)' },

	infoBar: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
	infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
	infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	infoText: { fontSize: fontSize.xs, color: colors.foregroundSecondary },
	statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full, borderWidth: 1 },
	statusOpen: { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' },
	statusClosed: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
	statusText: { fontSize: 11, fontWeight: '600' },
	statusTextOpen: { color: '#15803D' },
	statusTextClosed: { color: '#DC2626' },
	instantBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full, borderWidth: 1, borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' },
	instantText: { fontSize: 11, fontWeight: '600', color: colors.primary },

	descriptionSection: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surfaceSecondary },
	descriptionText: { fontSize: fontSize.sm, color: colors.foregroundSecondary, lineHeight: 20 },

	tabsContainer: { borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
	tabsScroll: { paddingHorizontal: spacing.lg, gap: spacing.xs },
	tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
	tabActive: { borderBottomColor: colors.primary },
	tabText: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foregroundSecondary },
	tabTextActive: { color: colors.primary, fontWeight: '600' },
})
