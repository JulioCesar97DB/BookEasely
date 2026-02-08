import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
	ActivityIndicator,
	FlatList,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../lib/auth-context'
import { supabase } from '../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../lib/theme'
import type { Business, Category } from '../../lib/types'

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
	barbershop: 'cut-outline',
	'hair-salon': 'sparkles-outline',
	'nail-salon': 'color-palette-outline',
	'spa-massage': 'leaf-outline',
	'fitness-training': 'barbell-outline',
	'medical-dental': 'medkit-outline',
	'beauty-aesthetics': 'flower-outline',
	consulting: 'chatbubble-ellipses-outline',
	'tutoring-education': 'school-outline',
	'pet-services': 'paw-outline',
	'auto-services': 'car-outline',
	'home-services': 'home-outline',
	photography: 'camera-outline',
	'tattoo-piercing': 'brush-outline',
	other: 'grid-outline',
}

const defaultCategories: Category[] = [
	{ id: '1', name: 'Barbershop', slug: 'barbershop', icon_url: null, sort_order: 1 },
	{ id: '2', name: 'Hair Salon', slug: 'hair-salon', icon_url: null, sort_order: 2 },
	{ id: '3', name: 'Nail Salon', slug: 'nail-salon', icon_url: null, sort_order: 3 },
	{ id: '4', name: 'Spa & Massage', slug: 'spa-massage', icon_url: null, sort_order: 4 },
	{ id: '5', name: 'Fitness', slug: 'fitness-training', icon_url: null, sort_order: 5 },
	{ id: '6', name: 'Medical', slug: 'medical-dental', icon_url: null, sort_order: 6 },
	{ id: '7', name: 'Beauty', slug: 'beauty-aesthetics', icon_url: null, sort_order: 7 },
	{ id: '8', name: 'Pet Services', slug: 'pet-services', icon_url: null, sort_order: 8 },
	{ id: '9', name: 'Photography', slug: 'photography', icon_url: null, sort_order: 9 },
	{ id: '10', name: 'Tutoring', slug: 'tutoring-education', icon_url: null, sort_order: 10 },
	{ id: '11', name: 'Auto Services', slug: 'auto-services', icon_url: null, sort_order: 11 },
	{ id: '12', name: 'Home Services', slug: 'home-services', icon_url: null, sort_order: 12 },
]

interface BusinessWithCategory extends Business {
	categories?: { name: string; slug: string } | null
}

export default function DiscoverScreen() {
	const { user } = useAuth()
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
	const [categories, setCategories] = useState<Category[]>(defaultCategories)
	const [businesses, setBusinesses] = useState<BusinessWithCategory[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

	useEffect(() => {
		async function loadCategories() {
			const { data } = await supabase
				.from('categories')
				.select('*')
				.order('sort_order')
			if (data && data.length > 0) {
				setCategories(data)
			}
		}
		loadCategories()
	}, [])

	const fetchBusinesses = useCallback(async (category: string | null, query: string) => {
		setIsLoading(true)
		let q = supabase
			.from('businesses')
			.select('*, categories(name, slug)')
			.eq('is_active', true)
			.order('rating_avg', { ascending: false })
			.limit(50)

		if (category) {
			q = q.eq('categories.slug', category)
		}
		if (query.trim()) {
			q = q.ilike('name', `%${query.trim()}%`)
		}

		const { data } = await q
		setBusinesses(data ?? [])
		setIsLoading(false)
	}, [])

	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => {
			fetchBusinesses(selectedCategory, searchQuery)
		}, 300)

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current)
		}
	}, [selectedCategory, searchQuery, fetchBusinesses])

	const handleCategoryPress = (slug: string) => {
		setSelectedCategory(prev => prev === slug ? null : slug)
	}

	const renderBusinessCard = useCallback(({ item }: { item: BusinessWithCategory }) => (
		<View style={styles.businessCard}>
			<View style={styles.businessImage}>
				{item.cover_image_url ? (
					<Image source={{ uri: item.cover_image_url }} style={styles.businessImageInner} />
				) : (
					<View style={styles.businessImagePlaceholder}>
						<Ionicons name="storefront-outline" size={28} color={colors.border} />
					</View>
				)}
			</View>
			<View style={styles.businessInfo}>
				<View style={styles.businessHeader}>
					<Text style={styles.businessName} numberOfLines={1}>{item.name}</Text>
					{item.rating_count > 0 && (
						<View style={styles.ratingBadge}>
							<Ionicons name="star" size={12} color={colors.primary} />
							<Text style={styles.ratingText}>{Number(item.rating_avg).toFixed(1)}</Text>
						</View>
					)}
				</View>
				<Text style={styles.businessCategory} numberOfLines={1}>
					{item.categories?.name ?? 'Uncategorized'}
				</Text>
				{(item.city || item.state) && (
					<View style={styles.locationRow}>
						<Ionicons name="location-outline" size={13} color={colors.foregroundSecondary} />
						<Text style={styles.locationText} numberOfLines={1}>
							{[item.city, item.state].filter(Boolean).join(', ')}
						</Text>
					</View>
				)}
			</View>
		</View>
	), [])

	const ListHeader = (
		<>
			{/* Header */}
			<View style={styles.header}>
				<View style={styles.headerTop}>
					<View style={styles.logoRow}>
						<View style={styles.logoIcon}>
							<Ionicons name="calendar" size={16} color={colors.white} />
						</View>
						<Text style={styles.logoText}>BookEasely</Text>
					</View>
					{!user && (
						<Link href="/(auth)/login" asChild>
							<TouchableOpacity style={styles.signInButton} activeOpacity={0.7}>
								<Text style={styles.signInText}>Sign in</Text>
							</TouchableOpacity>
						</Link>
					)}
				</View>
				<View>
					<Text style={styles.title}>
						{user ? 'Find your next' : 'Book with the'}
					</Text>
					<Text style={styles.title}>
						{user ? (
							<Text style={styles.titleAccent}>appointment</Text>
						) : (
							<><Text style={styles.titleAccent}>best </Text>{'near you'}</>
						)}
					</Text>
				</View>
			</View>

			{/* Search bar */}
			<View style={styles.searchContainer}>
				<Ionicons name="search" size={18} color={colors.foregroundSecondary} />
				<TextInput
					style={styles.searchInput}
					placeholder="Search businesses..."
					placeholderTextColor={colors.foregroundSecondary}
					value={searchQuery}
					onChangeText={setSearchQuery}
				/>
				{searchQuery.length > 0 && (
					<TouchableOpacity onPress={() => setSearchQuery('')}>
						<Ionicons name="close-circle" size={18} color={colors.foregroundSecondary} />
					</TouchableOpacity>
				)}
			</View>

			{/* Category chips */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.chipsContainer}
			>
				<TouchableOpacity
					style={[styles.chip, !selectedCategory && styles.chipActive]}
					onPress={() => setSelectedCategory(null)}
					activeOpacity={0.7}
				>
					<Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>All</Text>
				</TouchableOpacity>
				{categories.map((cat) => (
					<TouchableOpacity
						key={cat.id}
						style={[styles.chip, selectedCategory === cat.slug && styles.chipActive]}
						onPress={() => handleCategoryPress(cat.slug)}
						activeOpacity={0.7}
					>
						<Ionicons
							name={categoryIcons[cat.slug] || 'grid-outline'}
							size={14}
							color={selectedCategory === cat.slug ? colors.white : colors.foreground}
						/>
						<Text style={[styles.chipText, selectedCategory === cat.slug && styles.chipTextActive]}>
							{cat.name}
						</Text>
					</TouchableOpacity>
				))}
			</ScrollView>

			{/* Results count */}
			<View style={styles.resultsRow}>
				<Text style={styles.resultsText}>
					{isLoading ? 'Searching...' : `${businesses.length} ${businesses.length === 1 ? 'business' : 'businesses'} found`}
				</Text>
			</View>
		</>
	)

	const ListEmpty = isLoading ? (
		<View style={styles.emptyState}>
			<ActivityIndicator size="large" color={colors.primary} />
		</View>
	) : (
		<View style={styles.emptyState}>
			<Ionicons name="search-outline" size={44} color={colors.border} />
			<Text style={styles.emptyTitle}>No businesses found</Text>
			<Text style={styles.emptySubtitle}>
				Try adjusting your search or filter
			</Text>
			{(searchQuery || selectedCategory) && (
				<TouchableOpacity
					style={styles.clearButton}
					onPress={() => { setSearchQuery(''); setSelectedCategory(null) }}
					activeOpacity={0.7}
				>
					<Text style={styles.clearButtonText}>Clear filters</Text>
				</TouchableOpacity>
			)}
		</View>
	)

	const ListFooter = !user ? (
		<View style={styles.ctaCard}>
			<Text style={styles.ctaTitle}>Own a business?</Text>
			<Text style={styles.ctaSubtitle}>
				List your business on BookEasely and start receiving bookings today.
			</Text>
			<Link href="/(auth)/signup" asChild>
				<TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
					<Text style={styles.ctaButtonText}>Get started free</Text>
					<Ionicons name="arrow-forward" size={16} color={colors.white} />
				</TouchableOpacity>
			</Link>
		</View>
	) : (
		<View style={{ height: spacing['3xl'] }} />
	)

	return (
		<SafeAreaView style={styles.container} edges={['top']}>
			<FlatList
				data={businesses}
				renderItem={renderBusinessCard}
				keyExtractor={(item) => item.id}
				ListHeaderComponent={ListHeader}
				ListEmptyComponent={ListEmpty}
				ListFooterComponent={ListFooter}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
			/>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	listContent: {
		paddingBottom: spacing['3xl'],
	},
	header: {
		paddingHorizontal: spacing['2xl'],
		paddingTop: spacing.md,
		paddingBottom: spacing.xl,
		gap: spacing.xl,
	},
	headerTop: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	logoRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
	},
	logoIcon: {
		width: 30,
		height: 30,
		borderRadius: radius.sm,
		backgroundColor: colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
	logoText: {
		fontSize: fontSize.base,
		fontWeight: '700',
		color: colors.foreground,
		letterSpacing: -0.3,
	},
	title: {
		fontSize: fontSize['4xl'],
		fontWeight: '800',
		color: colors.foreground,
		letterSpacing: -1,
		lineHeight: 42,
	},
	titleAccent: {
		color: colors.primary,
	},
	signInButton: {
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.sm,
		borderRadius: radius.md,
		backgroundColor: colors.primary,
	},
	signInText: {
		fontSize: fontSize.sm,
		fontWeight: '600',
		color: colors.white,
	},
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
		marginHorizontal: spacing['2xl'],
		paddingHorizontal: spacing.lg,
		height: 48,
		borderRadius: radius.md,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
	},
	searchInput: {
		flex: 1,
		fontSize: fontSize.base,
		color: colors.foreground,
	},
	chipsContainer: {
		paddingHorizontal: spacing['2xl'],
		paddingVertical: spacing.lg,
		gap: spacing.sm,
	},
	chip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.sm,
		borderRadius: radius.full,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.surface,
	},
	chipActive: {
		backgroundColor: colors.primary,
		borderColor: colors.primary,
	},
	chipText: {
		fontSize: fontSize.sm,
		fontWeight: '500',
		color: colors.foreground,
	},
	chipTextActive: {
		color: colors.white,
	},
	resultsRow: {
		paddingHorizontal: spacing['2xl'],
		paddingBottom: spacing.md,
	},
	resultsText: {
		fontSize: fontSize.sm,
		color: colors.foregroundSecondary,
	},
	businessCard: {
		marginHorizontal: spacing['2xl'],
		marginBottom: spacing.lg,
		borderRadius: radius.lg,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		overflow: 'hidden',
	},
	businessImage: {
		height: 160,
		backgroundColor: colors.surfaceSecondary,
	},
	businessImageInner: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
	businessImagePlaceholder: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	businessInfo: {
		padding: spacing.lg,
		gap: 4,
	},
	businessHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	businessName: {
		flex: 1,
		fontSize: fontSize.base,
		fontWeight: '600',
		color: colors.foreground,
	},
	ratingBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: spacing.sm,
		paddingVertical: 4,
		borderRadius: radius.sm,
		backgroundColor: colors.primaryLight,
		marginLeft: spacing.sm,
	},
	ratingText: {
		fontSize: fontSize.sm,
		fontWeight: '600',
		color: colors.primary,
	},
	businessCategory: {
		fontSize: fontSize.sm,
		color: colors.foregroundSecondary,
	},
	locationRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		marginTop: 2,
	},
	locationText: {
		fontSize: fontSize.sm,
		color: colors.foregroundSecondary,
	},
	emptyState: {
		alignItems: 'center',
		gap: spacing.sm,
		paddingVertical: spacing['5xl'],
	},
	emptyTitle: {
		fontSize: fontSize.base,
		fontWeight: '600',
		color: colors.foregroundSecondary,
	},
	emptySubtitle: {
		fontSize: fontSize.sm,
		color: colors.foregroundSecondary,
	},
	clearButton: {
		marginTop: spacing.md,
		paddingHorizontal: spacing.xl,
		paddingVertical: spacing.sm,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
	},
	clearButtonText: {
		fontSize: fontSize.sm,
		fontWeight: '500',
		color: colors.foreground,
	},
	ctaCard: {
		marginHorizontal: spacing['2xl'],
		marginTop: spacing.xl,
		padding: spacing['2xl'],
		borderRadius: radius.lg,
		backgroundColor: colors.primary,
		gap: spacing.md,
	},
	ctaTitle: {
		fontSize: fontSize.xl,
		fontWeight: '700',
		color: colors.white,
	},
	ctaSubtitle: {
		fontSize: fontSize.sm,
		color: 'rgba(255,255,255,0.75)',
		lineHeight: 20,
	},
	ctaButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing.sm,
		height: 44,
		borderRadius: radius.md,
		backgroundColor: 'rgba(255,255,255,0.2)',
		marginTop: spacing.sm,
	},
	ctaButtonText: {
		fontSize: fontSize.sm,
		fontWeight: '600',
		color: colors.white,
	},
})
