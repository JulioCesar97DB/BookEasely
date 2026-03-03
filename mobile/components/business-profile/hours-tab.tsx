import { Ionicons } from '@expo/vector-icons'
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { DAYS_FULL, DAYS_SHORT } from '../../lib/constants'
import { formatTime } from '../../lib/format'
import { colors, fontSize, radius, spacing } from '../../lib/theme'
import type { BusinessHours, BusinessWithCategory } from '../../lib/types'

interface HoursSectionProps {
	hours: BusinessHours[]
	business: BusinessWithCategory
}

export function HoursSection({ hours, business }: HoursSectionProps) {
	const today = new Date().getDay()
	const fullAddress = [business.address, business.city, business.state, business.zip_code]
		.filter(Boolean)
		.join(', ')

	return (
		<View style={styles.sectionList}>
			{/* Hours */}
			<View style={styles.hoursCard}>
				<Text style={styles.cardTitle}>Business Hours</Text>
				{DAYS_FULL.map((_, i) => {
					const dayHours = hours.find((h) => h.day_of_week === i)
					const isToday = i === today
					return (
						<View key={i} style={[styles.hourRow, isToday && styles.hourRowToday]}>
							<View style={styles.hourDayCol}>
								{isToday && <View style={styles.todayDot} />}
								<Text style={[styles.hourDay, isToday && styles.hourDayToday]}>
									{DAYS_SHORT[i]}
								</Text>
							</View>
							<Text
								style={[
									styles.hourTime,
									isToday && styles.hourTimeToday,
									(dayHours?.is_closed || !dayHours) && styles.hourClosed,
								]}
							>
								{!dayHours || dayHours.is_closed
									? 'Closed'
									: `${formatTime(dayHours.open_time)} - ${formatTime(dayHours.close_time)}`}
							</Text>
						</View>
					)
				})}
			</View>

			{/* Contact */}
			<View style={styles.contactCard}>
				<Text style={styles.cardTitle}>Contact & Location</Text>

				{fullAddress && (
					<View style={styles.contactRow}>
						<Ionicons name="location-outline" size={16} color={colors.foregroundSecondary} />
						<Text style={styles.contactText}>{fullAddress}</Text>
					</View>
				)}
				{business.phone && (
					<TouchableOpacity
						style={styles.contactRow}
						onPress={() => Linking.openURL(`tel:${business.phone}`)}
					>
						<Ionicons name="call-outline" size={16} color={colors.foregroundSecondary} />
						<Text style={[styles.contactText, styles.contactLink]}>{business.phone}</Text>
					</TouchableOpacity>
				)}
				{business.email && (
					<TouchableOpacity
						style={styles.contactRow}
						onPress={() => Linking.openURL(`mailto:${business.email}`)}
					>
						<Ionicons name="mail-outline" size={16} color={colors.foregroundSecondary} />
						<Text style={[styles.contactText, styles.contactLink]}>{business.email}</Text>
					</TouchableOpacity>
				)}
				{business.website && (
					<TouchableOpacity
						style={styles.contactRow}
						onPress={() => Linking.openURL(business.website!)}
					>
						<Ionicons name="globe-outline" size={16} color={colors.foregroundSecondary} />
						<Text style={[styles.contactText, styles.contactLink]} numberOfLines={1}>
							{business.website.replace(/^https?:\/\//, '')}
						</Text>
					</TouchableOpacity>
				)}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	sectionList: { gap: spacing.md },
	hoursCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: 4 },
	cardTitle: { fontSize: fontSize.sm, fontWeight: '600', color: colors.foreground, marginBottom: spacing.sm },
	hourRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingHorizontal: spacing.sm, borderRadius: radius.sm },
	hourRowToday: { backgroundColor: colors.primaryLight },
	hourDayCol: { flexDirection: 'row', alignItems: 'center', gap: 6 },
	todayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
	hourDay: { fontSize: fontSize.sm, color: colors.foreground, width: 36 },
	hourDayToday: { fontWeight: '600', color: colors.primary },
	hourTime: { fontSize: fontSize.sm, color: colors.foregroundSecondary },
	hourTimeToday: { fontWeight: '600', color: colors.foreground },
	hourClosed: { color: colors.border },
	contactCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md },
	contactRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
	contactText: { fontSize: fontSize.sm, color: colors.foreground, flex: 1 },
	contactLink: { color: colors.primary },
})
