import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'
import { colors, fontSize, radius, spacing } from '../lib/theme'
import type { BusinessWithCategory } from '../lib/types'
import { BusinessImageCarousel } from './business-image-carousel'

interface BusinessCardProps {
	business: BusinessWithCategory
	width: number
}

export function BusinessCard({ business, width }: BusinessCardProps) {
	const location = [business.city, business.state].filter(Boolean).join(', ')

	return (
		<View style={[styles.card, { width }]}>
			<BusinessImageCarousel
				images={business.photos?.length ? business.photos : (business.cover_image_url ? [business.cover_image_url] : [])}
				height={width}
				width={width}
			/>
			<View style={styles.info}>
				<Text style={styles.name} numberOfLines={1}>{business.name}</Text>

				<View style={styles.ratingCategoryRow}>
					{business.rating_count > 0 ? (
						<View style={styles.ratingInline}>
							<Ionicons name="star" size={11} color="#F59E0B" />
							<Text style={styles.ratingValue}>{Number(business.rating_avg).toFixed(1)}</Text>
							<Text style={styles.ratingCount}>({business.rating_count})</Text>
						</View>
					) : (
						<Text style={styles.newLabel}>New</Text>
					)}
					{business.categories?.name && (
						<>
							<Text style={styles.dot}>&middot;</Text>
							<Text style={styles.category} numberOfLines={1}>{business.categories.name}</Text>
						</>
					)}
				</View>

				{location ? (
					<View style={styles.detailRow}>
						<Ionicons name="location-outline" size={12} color={colors.foregroundSecondary} />
						<Text style={styles.detailText} numberOfLines={1}>{location}</Text>
					</View>
				) : null}

				{business.phone ? (
					<View style={styles.detailRow}>
						<Ionicons name="call-outline" size={12} color={colors.foregroundSecondary} />
						<Text style={styles.detailText} numberOfLines={1}>{business.phone}</Text>
					</View>
				) : null}

				{business.auto_confirm && (
					<View style={styles.instantBadge}>
						<Ionicons name="flash-outline" size={10} color={colors.success} />
						<Text style={styles.instantText}>Instant</Text>
					</View>
				)}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	card: {
		borderRadius: radius.lg,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		overflow: 'hidden',
	},
	info: {
		padding: spacing.md,
		gap: 4,
	},
	name: {
		fontSize: fontSize.sm,
		fontWeight: '600',
		color: colors.foreground,
	},
	ratingCategoryRow: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 3,
	},
	ratingInline: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
	},
	ratingValue: {
		fontSize: fontSize.xs,
		fontWeight: '600',
		color: colors.foreground,
	},
	ratingCount: {
		fontSize: fontSize.xs,
		color: colors.foregroundSecondary,
	},
	newLabel: {
		fontSize: fontSize.xs,
		color: colors.foregroundSecondary,
	},
	dot: {
		fontSize: fontSize.xs,
		color: colors.border,
	},
	category: {
		fontSize: fontSize.xs,
		color: colors.foregroundSecondary,
		flexShrink: 1,
	},
	detailRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
		marginTop: 1,
	},
	detailText: {
		fontSize: fontSize.xs,
		color: colors.foregroundSecondary,
		flexShrink: 1,
	},
	instantBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'flex-start',
		gap: 2,
		marginTop: 3,
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: radius.full,
		backgroundColor: colors.successLight,
	},
	instantText: {
		fontSize: 10,
		fontWeight: '600',
		color: colors.success,
	},
})
