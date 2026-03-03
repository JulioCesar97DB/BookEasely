import { Ionicons } from '@expo/vector-icons'
import { Image, StyleSheet, Text, View } from 'react-native'
import { getInitials } from '../../lib/format'
import { colors, fontSize, radius, spacing } from '../../lib/theme'
import type { BusinessWithCategory } from '../../lib/types'

export interface ReviewWithProfile {
	id: string
	rating: number
	comment: string | null
	business_response: string | null
	created_at: string
	profiles: { full_name: string; avatar_url: string | null } | null
}

interface ReviewsSectionProps {
	reviews: ReviewWithProfile[]
	business: BusinessWithCategory
}

export function ReviewsSection({ reviews, business }: ReviewsSectionProps) {
	if (reviews.length === 0) {
		return (
			<View style={styles.emptyState}>
				<Ionicons name="chatbubble-outline" size={36} color={colors.border} />
				<Text style={styles.emptyTitle}>No reviews yet</Text>
			</View>
		)
	}

	return (
		<View style={styles.sectionList}>
			{/* Summary */}
			<View style={styles.reviewSummary}>
				<View style={styles.reviewSummaryLeft}>
					<Text style={styles.reviewAvg}>{Number(business.rating_avg).toFixed(1)}</Text>
					<View style={styles.starsRow}>
						{Array.from({ length: 5 }).map((_, i) => (
							<Ionicons
								key={i}
								name={i < Math.round(Number(business.rating_avg)) ? 'star' : 'star-outline'}
								size={14}
								color={i < Math.round(Number(business.rating_avg)) ? colors.star : colors.border}
							/>
						))}
					</View>
					<Text style={styles.reviewCount}>
						{business.rating_count} {business.rating_count === 1 ? 'review' : 'reviews'}
					</Text>
				</View>
				<View style={styles.reviewBars}>
					{[5, 4, 3, 2, 1].map((rating) => {
						const count = reviews.filter((r) => r.rating === rating).length
						const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
						return (
							<View key={rating} style={styles.barRow}>
								<Text style={styles.barLabel}>{rating}</Text>
								<Ionicons name="star" size={10} color={colors.star} />
								<View style={styles.barTrack}>
									<View style={[styles.barFill, { width: `${pct}%` }]} />
								</View>
								<Text style={styles.barCount}>{count}</Text>
							</View>
						)
					})}
				</View>
			</View>

			{/* Individual reviews */}
			{reviews.map((review) => (
				<View key={review.id} style={styles.reviewCard}>
					<View style={styles.reviewHeader}>
						<View style={styles.reviewerAvatar}>
							{review.profiles?.avatar_url ? (
								<Image source={{ uri: review.profiles.avatar_url }} style={styles.reviewerAvatarImg} />
							) : (
								<Text style={styles.reviewerAvatarText}>
									{review.profiles ? getInitials(review.profiles.full_name)[0] : '?'}
								</Text>
							)}
						</View>
						<View style={styles.reviewerInfo}>
							<Text style={styles.reviewerName}>
								{review.profiles?.full_name ?? 'Anonymous'}
							</Text>
							<View style={styles.starsRow}>
								{Array.from({ length: 5 }).map((_, i) => (
									<Ionicons
										key={i}
										name={i < review.rating ? 'star' : 'star-outline'}
										size={12}
										color={i < review.rating ? colors.star : colors.border}
									/>
								))}
							</View>
						</View>
						<Text style={styles.reviewDate}>
							{new Date(review.created_at).toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric',
							})}
						</Text>
					</View>
					{review.comment && (
						<Text style={styles.reviewComment}>{review.comment}</Text>
					)}
					{review.business_response && (
						<View style={styles.businessResponse}>
							<Text style={styles.responseLabel}>Business response</Text>
							<Text style={styles.responseText}>{review.business_response}</Text>
						</View>
					)}
				</View>
			))}
		</View>
	)
}

const styles = StyleSheet.create({
	sectionList: { gap: spacing.md },
	reviewSummary: { flexDirection: 'row', gap: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
	reviewSummaryLeft: { alignItems: 'center', justifyContent: 'center' },
	reviewAvg: { fontSize: fontSize['3xl'], fontWeight: '700', color: colors.foreground, letterSpacing: -1 },
	starsRow: { flexDirection: 'row', gap: 1, marginTop: 2 },
	reviewCount: { fontSize: fontSize.xs, color: colors.foregroundSecondary, marginTop: 4 },
	reviewBars: { flex: 1, gap: 4, justifyContent: 'center' },
	barRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	barLabel: { width: 10, fontSize: fontSize.xs, color: colors.foregroundSecondary, textAlign: 'right' },
	barTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.surfaceSecondary, overflow: 'hidden' },
	barFill: { height: '100%', borderRadius: 3, backgroundColor: colors.star },
	barCount: { width: 16, fontSize: fontSize.xs, color: colors.foregroundSecondary, textAlign: 'right' },
	reviewCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
	reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
	reviewerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center' },
	reviewerAvatarImg: { width: 32, height: 32, borderRadius: 16 },
	reviewerAvatarText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.foregroundSecondary },
	reviewerInfo: { flex: 1 },
	reviewerName: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foreground },
	reviewDate: { fontSize: 11, color: colors.foregroundSecondary },
	reviewComment: { fontSize: fontSize.sm, color: colors.foregroundSecondary, lineHeight: 20, marginTop: spacing.md },
	businessResponse: { marginTop: spacing.md, padding: spacing.md, borderRadius: radius.sm, backgroundColor: colors.surfaceSecondary, borderLeftWidth: 2, borderLeftColor: colors.primaryLight },
	responseLabel: { fontSize: 11, fontWeight: '600', color: colors.foregroundSecondary, marginBottom: 4 },
	responseText: { fontSize: fontSize.xs, color: colors.foregroundSecondary, lineHeight: 18 },
	emptyState: { alignItems: 'center', paddingVertical: spacing['5xl'], gap: spacing.sm },
	emptyTitle: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foregroundSecondary },
})
