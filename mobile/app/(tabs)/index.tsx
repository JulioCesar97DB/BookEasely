import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { useEffect, useState } from 'react'
import {
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../lib/auth-context'
import { supabase } from '../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../lib/theme'
import type { Category } from '../../lib/types'

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

export default function DiscoverScreen() {
	const { user } = useAuth()
	const [searchQuery, setSearchQuery] = useState('')
	const [categories, setCategories] = useState<Category[]>([])

	useEffect(() => {
		async function loadCategories() {
			const { data } = await supabase
				.from('categories')
				.select('*')
				.order('sort_order')
			setCategories(data && data.length > 0 ? data : defaultCategories)
		}
		loadCategories()
	}, [])

	return (
		<SafeAreaView style={styles.container} edges={['top']}>
			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View style={styles.header}>
					<View>
						<Text style={styles.greeting}>
							{user ? 'Find your next appointment' : 'Book appointments'}
						</Text>
						<Text style={styles.title}>in seconds</Text>
					</View>
					{!user && (
						<Link href="/(auth)/login" asChild>
							<TouchableOpacity style={styles.signInButton} activeOpacity={0.7}>
								<Text style={styles.signInText}>Sign in</Text>
							</TouchableOpacity>
						</Link>
					)}
				</View>

				{/* Search bar */}
				<View style={styles.searchContainer}>
					<Ionicons name="search" size={18} color={colors.foregroundSecondary} />
					<TextInput
						style={styles.searchInput}
						placeholder="Search services or businesses..."
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

				{/* Categories */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Browse by category</Text>
					<View style={styles.categoriesGrid}>
						{categories.map((cat) => (
							<TouchableOpacity
								key={cat.id}
								style={styles.categoryCard}
								activeOpacity={0.7}
							>
								<View style={styles.categoryIcon}>
									<Ionicons
										name={categoryIcons[cat.slug] || 'grid-outline'}
										size={22}
										color={colors.primary}
									/>
								</View>
								<Text style={styles.categoryName} numberOfLines={1}>
									{cat.name}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				{/* Popular nearby - placeholder */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Popular near you</Text>
						<TouchableOpacity>
							<Text style={styles.seeAllLink}>See all</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.emptyState}>
						<Ionicons name="location-outline" size={40} color={colors.border} />
						<Text style={styles.emptyTitle}>No businesses found</Text>
						<Text style={styles.emptySubtitle}>
							Businesses in your area will appear here
						</Text>
					</View>
				</View>

				{/* CTA for non-logged-in users */}
				{!user && (
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
				)}

				<View style={{ height: spacing['3xl'] }} />
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		paddingHorizontal: spacing['2xl'],
		paddingTop: spacing.lg,
		paddingBottom: spacing.xl,
	},
	greeting: {
		fontSize: fontSize.base,
		color: colors.foregroundSecondary,
	},
	title: {
		fontSize: fontSize['3xl'],
		fontWeight: '700',
		color: colors.foreground,
		letterSpacing: -0.5,
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
		marginBottom: spacing['2xl'],
	},
	searchInput: {
		flex: 1,
		fontSize: fontSize.base,
		color: colors.foreground,
	},
	section: {
		paddingHorizontal: spacing['2xl'],
		marginBottom: spacing['2xl'],
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: spacing.lg,
	},
	sectionTitle: {
		fontSize: fontSize.lg,
		fontWeight: '700',
		color: colors.foreground,
		marginBottom: spacing.lg,
	},
	seeAllLink: {
		fontSize: fontSize.sm,
		fontWeight: '500',
		color: colors.primary,
		marginBottom: spacing.lg,
	},
	categoriesGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: spacing.md,
	},
	categoryCard: {
		width: '22%',
		alignItems: 'center',
		gap: spacing.sm,
	},
	categoryIcon: {
		width: 52,
		height: 52,
		borderRadius: radius.lg,
		backgroundColor: colors.primaryLight,
		justifyContent: 'center',
		alignItems: 'center',
	},
	categoryName: {
		fontSize: fontSize.xs,
		fontWeight: '500',
		color: colors.foreground,
		textAlign: 'center',
	},
	emptyState: {
		alignItems: 'center',
		gap: spacing.sm,
		paddingVertical: spacing['4xl'],
		backgroundColor: colors.surface,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.border,
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
	ctaCard: {
		marginHorizontal: spacing['2xl'],
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
