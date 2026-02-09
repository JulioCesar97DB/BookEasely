import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Dimensions,
	Image,
	Linking,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AnimatedScreen } from '../../components/animated-screen'
import { BusinessImageCarousel } from '../../components/business-image-carousel'
import { useAuth } from '../../lib/auth-context'
import { supabase } from '../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../lib/theme'
import type {
	BusinessHours,
	BusinessWithCategory,
	Service,
	Worker,
} from '../../lib/types'

interface ReviewWithProfile {
	id: string
	rating: number
	comment: string | null
	business_response: string | null
	created_at: string
	profiles: { full_name: string; avatar_url: string | null } | null
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const TABS = ['Services', 'Team', 'Reviews', 'Hours'] as const
type Tab = (typeof TABS)[number]

function formatTime(time: string) {
	const [h, m] = time.split(':').map(Number)
	const ampm = h >= 12 ? 'PM' : 'AM'
	const hour = h % 12 || 12
	return m === 0 ? `${hour} ${ampm}` : `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

function formatDuration(minutes: number) {
	if (minutes < 60) return `${minutes}min`
	const h = Math.floor(minutes / 60)
	const m = minutes % 60
	return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function getInitials(name: string) {
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)
}

function isOpenNow(hours: BusinessHours[]) {
	const now = new Date()
	const today = now.getDay()
	const todayHours = hours.find((h) => h.day_of_week === today)
	if (!todayHours || todayHours.is_closed) return false
	const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
	return currentTime >= todayHours.open_time && currentTime < todayHours.close_time
}

const screenWidth = Dimensions.get('window').width

export default function BusinessProfileScreen() {
	const { slug } = useLocalSearchParams<{ slug: string }>()
	const router = useRouter()
	const { user } = useAuth()

	const [business, setBusiness] = useState<BusinessWithCategory | null>(null)
	const [services, setServices] = useState<Service[]>([])
	const [workers, setWorkers] = useState<Worker[]>([])
	const [serviceWorkers, setServiceWorkers] = useState<{ service_id: string; worker_id: string }[]>([])
	const [hours, setHours] = useState<BusinessHours[]>([])
	const [reviews, setReviews] = useState<ReviewWithProfile[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [activeTab, setActiveTab] = useState<Tab>('Services')

	useEffect(() => {
		async function load() {
			const { data: biz } = await supabase
				.from('businesses')
				.select('*, categories(name, slug)')
				.eq('slug', slug)
				.eq('is_active', true)
				.single()

			if (!biz) {
				setIsLoading(false)
				return
			}

			setBusiness(biz)

			const [svcRes, wrkRes, swRes, hrsRes, revRes] = await Promise.all([
				supabase.from('services').select('*').eq('business_id', biz.id).eq('is_active', true).order('price'),
				supabase.from('workers').select('*').eq('business_id', biz.id).eq('is_active', true).order('display_name'),
				supabase.from('service_workers').select('service_id, worker_id'),
				supabase.from('business_hours').select('*').eq('business_id', biz.id).order('day_of_week'),
				supabase
					.from('reviews')
					.select('*, profiles:client_id(full_name, avatar_url)')
					.eq('business_id', biz.id)
					.order('created_at', { ascending: false })
					.limit(20),
			])

			setServices(svcRes.data ?? [])
			setWorkers(wrkRes.data ?? [])
			setServiceWorkers(swRes.data ?? [])
			setHours(hrsRes.data ?? [])
			setReviews((revRes.data as ReviewWithProfile[]) ?? [])
			setIsLoading(false)
		}
		load()
	}, [slug])

	const serviceWorkerMap = useMemo(() => {
		const sIds = new Set(services.map((s) => s.id))
		const wIds = new Set(workers.map((w) => w.id))
		const map = new Map<string, string[]>()
		for (const sw of serviceWorkers) {
			if (!sIds.has(sw.service_id) || !wIds.has(sw.worker_id)) continue
			const arr = map.get(sw.service_id) ?? []
			arr.push(sw.worker_id)
			map.set(sw.service_id, arr)
		}
		return map
	}, [services, workers, serviceWorkers])

	const workerServiceMap = useMemo(() => {
		const sIds = new Set(services.map((s) => s.id))
		const wIds = new Set(workers.map((w) => w.id))
		const map = new Map<string, string[]>()
		for (const sw of serviceWorkers) {
			if (!sIds.has(sw.service_id) || !wIds.has(sw.worker_id)) continue
			const arr = map.get(sw.worker_id) ?? []
			arr.push(sw.service_id)
			map.set(sw.worker_id, arr)
		}
		return map
	}, [services, workers, serviceWorkers])

	const workersById = useMemo(() => new Map(workers.map((w) => [w.id, w])), [workers])
	const servicesById = useMemo(() => new Map(services.map((s) => [s.id, s])), [services])

	const images = business?.photos?.length
		? business.photos
		: business?.cover_image_url
			? [business.cover_image_url]
			: []

	const location = business ? [business.city, business.state].filter(Boolean).join(', ') : ''
	const open = isOpenNow(hours)

	const handleBookNow = useCallback(() => {
		if (!user) {
			router.push('/(auth)/login')
		}
		// Booking flow not built yet
	}, [user, router])

	if (isLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primary} />
				</View>
			</SafeAreaView>
		)
	}

	if (!business) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.notFoundContainer}>
					<Ionicons name="storefront-outline" size={48} color={colors.border} />
					<Text style={styles.notFoundTitle}>Business not found</Text>
					<TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
						<Text style={styles.backButtonText}>Go back</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		)
	}

	return (
		<AnimatedScreen>
			<View style={styles.container}>
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					{/* Hero Image */}
					<View style={styles.heroContainer}>
						<BusinessImageCarousel images={images} height={200} width={screenWidth} />
						<View style={styles.heroOverlay} />

						{/* Back button */}
						<SafeAreaView style={styles.heroNav} edges={['top']}>
							<TouchableOpacity
								style={styles.heroNavButton}
								onPress={() => router.back()}
								activeOpacity={0.7}
							>
								<Ionicons name="chevron-back" size={22} color="#fff" />
							</TouchableOpacity>
						</SafeAreaView>

						{/* Hero info */}
						<View style={styles.heroInfo}>
							{business.categories?.name && (
								<View style={styles.categoryBadge}>
									<Text style={styles.categoryBadgeText}>{business.categories.name}</Text>
								</View>
							)}
							<Text style={styles.heroName}>{business.name}</Text>
							<View style={styles.heroMeta}>
								{business.rating_count > 0 ? (
									<View style={styles.ratingRow}>
										<Ionicons name="star" size={14} color="#F59E0B" />
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
									onPress={() => setActiveTab(tab)}
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

					{/* Tab Content */}
					<View style={styles.tabContent}>
						{activeTab === 'Services' && (
							<ServicesSection services={services} serviceWorkerMap={serviceWorkerMap} workersById={workersById} />
						)}
						{activeTab === 'Team' && (
							<WorkersSection workers={workers} workerServiceMap={workerServiceMap} servicesById={servicesById} />
						)}
						{activeTab === 'Reviews' && (
							<ReviewsSection reviews={reviews} business={business} />
						)}
						{activeTab === 'Hours' && (
							<HoursSection hours={hours} business={business} />
						)}
					</View>
				</ScrollView>

				{/* Sticky Book Now */}
				<SafeAreaView edges={['bottom']} style={styles.bookNowBar}>
					<TouchableOpacity style={styles.bookNowButton} onPress={handleBookNow} activeOpacity={0.8}>
						<Text style={styles.bookNowText}>Book Now</Text>
					</TouchableOpacity>
				</SafeAreaView>
			</View>
		</AnimatedScreen>
	)
}

/* ─── Services ─────────────────────────────────────────────── */

function ServicesSection({
	services,
	serviceWorkerMap,
	workersById,
}: {
	services: Service[]
	serviceWorkerMap: Map<string, string[]>
	workersById: Map<string, Worker>
}) {
	if (services.length === 0) {
		return <EmptyState icon="list-outline" title="No services listed" />
	}

	return (
		<View style={styles.sectionList}>
			{services.map((service) => {
				const workerIds = serviceWorkerMap.get(service.id) ?? []
				const assigned = workerIds.map((id) => workersById.get(id)).filter(Boolean) as Worker[]

				return (
					<View key={service.id} style={styles.serviceCard}>
						<View style={styles.serviceMain}>
							<View style={styles.serviceInfo}>
								<Text style={styles.serviceName}>{service.name}</Text>
								{service.description && (
									<Text style={styles.serviceDesc} numberOfLines={2}>
										{service.description}
									</Text>
								)}
								<View style={styles.serviceMeta}>
									<Ionicons name="time-outline" size={12} color={colors.foregroundSecondary} />
									<Text style={styles.serviceMetaText}>
										{formatDuration(service.duration_minutes)}
									</Text>
									{assigned.length > 0 && (
										<>
											<Text style={styles.serviceMetaText}> · </Text>
											<View style={styles.avatarGroup}>
												{assigned.slice(0, 3).map((w) => (
													<View key={w.id} style={styles.miniAvatar}>
														{w.avatar_url ? (
															<Image source={{ uri: w.avatar_url }} style={styles.miniAvatarImg} />
														) : (
															<Text style={styles.miniAvatarText}>{getInitials(w.display_name)[0]}</Text>
														)}
													</View>
												))}
											</View>
										</>
									)}
								</View>
							</View>
							<Text style={styles.servicePrice}>${Number(service.price).toFixed(0)}</Text>
						</View>
					</View>
				)
			})}
		</View>
	)
}

/* ─── Workers ──────────────────────────────────────────────── */

function WorkersSection({
	workers,
	workerServiceMap,
	servicesById,
}: {
	workers: Worker[]
	workerServiceMap: Map<string, string[]>
	servicesById: Map<string, Service>
}) {
	if (workers.length === 0) {
		return <EmptyState icon="people-outline" title="No team members" />
	}

	return (
		<View style={styles.sectionList}>
			{workers.map((worker) => {
				const serviceIds = workerServiceMap.get(worker.id) ?? []
				const assigned = serviceIds.map((id) => servicesById.get(id)).filter(Boolean) as Service[]

				return (
					<View key={worker.id} style={styles.workerCard}>
						<View style={styles.workerHeader}>
							<View style={styles.workerAvatar}>
								{worker.avatar_url ? (
									<Image source={{ uri: worker.avatar_url }} style={styles.workerAvatarImg} />
								) : (
									<Text style={styles.workerAvatarText}>{getInitials(worker.display_name)}</Text>
								)}
							</View>
							<View style={styles.workerInfo}>
								<Text style={styles.workerName}>{worker.display_name}</Text>
								{worker.bio && (
									<Text style={styles.workerBio} numberOfLines={2}>{worker.bio}</Text>
								)}
							</View>
						</View>

						{worker.specialties && worker.specialties.length > 0 && (
							<View style={styles.specialties}>
								{worker.specialties.map((s) => (
									<View key={s} style={styles.specialtyBadge}>
										<Text style={styles.specialtyText}>{s}</Text>
									</View>
								))}
							</View>
						)}

						{assigned.length > 0 && (
							<View style={styles.workerServices}>
								<Text style={styles.workerServicesLabel}>SERVICES</Text>
								<Text style={styles.workerServicesList} numberOfLines={2}>
									{assigned.map((s) => s.name).join(', ')}
								</Text>
							</View>
						)}
					</View>
				)
			})}
		</View>
	)
}

/* ─── Reviews ──────────────────────────────────────────────── */

function ReviewsSection({
	reviews,
	business,
}: {
	reviews: ReviewWithProfile[]
	business: BusinessWithCategory
}) {
	if (reviews.length === 0) {
		return <EmptyState icon="chatbubble-outline" title="No reviews yet" />
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
								color={i < Math.round(Number(business.rating_avg)) ? '#F59E0B' : colors.border}
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
								<Ionicons name="star" size={10} color="#F59E0B" />
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
										color={i < review.rating ? '#F59E0B' : colors.border}
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

/* ─── Hours & Info ─────────────────────────────────────────── */

function HoursSection({
	hours,
	business,
}: {
	hours: BusinessHours[]
	business: BusinessWithCategory
}) {
	const today = new Date().getDay()
	const fullAddress = [business.address, business.city, business.state, business.zip_code]
		.filter(Boolean)
		.join(', ')

	return (
		<View style={styles.sectionList}>
			{/* Hours */}
			<View style={styles.hoursCard}>
				<Text style={styles.cardTitle}>Business Hours</Text>
				{DAYS.map((_, i) => {
					const dayHours = hours.find((h) => h.day_of_week === i)
					const isToday = i === today
					return (
						<View key={i} style={[styles.hourRow, isToday && styles.hourRowToday]}>
							<View style={styles.hourDayCol}>
								{isToday && <View style={styles.todayDot} />}
								<Text style={[styles.hourDay, isToday && styles.hourDayToday]}>
									{SHORT_DAYS[i]}
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

/* ─── Empty State ──────────────────────────────────────────── */

function EmptyState({ icon, title }: { icon: keyof typeof Ionicons.glyphMap; title: string }) {
	return (
		<View style={styles.emptyState}>
			<Ionicons name={icon} size={36} color={colors.border} />
			<Text style={styles.emptyTitle}>{title}</Text>
		</View>
	)
}

/* ─── Styles ───────────────────────────────────────────────── */

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	scrollContent: { paddingBottom: 100 },
	loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	notFoundContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
	notFoundTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.foregroundSecondary },
	backButton: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginTop: spacing.md },
	backButtonText: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foreground },

	// Hero
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

	// Info bar
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

	// Description
	descriptionSection: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surfaceSecondary },
	descriptionText: { fontSize: fontSize.sm, color: colors.foregroundSecondary, lineHeight: 20 },

	// Tabs
	tabsContainer: { borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
	tabsScroll: { paddingHorizontal: spacing.lg, gap: spacing.xs },
	tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
	tabActive: { borderBottomColor: colors.primary },
	tabText: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foregroundSecondary },
	tabTextActive: { color: colors.primary, fontWeight: '600' },
	tabContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },

	// Sections
	sectionList: { gap: spacing.md },

	// Service cards
	serviceCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
	serviceMain: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
	serviceInfo: { flex: 1 },
	serviceName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.foreground },
	serviceDesc: { fontSize: fontSize.xs, color: colors.foregroundSecondary, marginTop: 2, lineHeight: 18 },
	serviceMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
	serviceMetaText: { fontSize: fontSize.xs, color: colors.foregroundSecondary },
	servicePrice: { fontSize: fontSize.sm, fontWeight: '600', color: colors.foreground },
	avatarGroup: { flexDirection: 'row' },
	miniAvatar: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: colors.surface, marginLeft: -4 },
	miniAvatarImg: { width: 18, height: 18, borderRadius: 9 },
	miniAvatarText: { fontSize: 8, fontWeight: '600', color: colors.foregroundSecondary },

	// Worker cards
	workerCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
	workerHeader: { flexDirection: 'row', gap: spacing.md },
	workerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center' },
	workerAvatarImg: { width: 44, height: 44, borderRadius: 22 },
	workerAvatarText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.foregroundSecondary },
	workerInfo: { flex: 1 },
	workerName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.foreground },
	workerBio: { fontSize: fontSize.xs, color: colors.foregroundSecondary, marginTop: 2, lineHeight: 18 },
	specialties: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md },
	specialtyBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.surfaceSecondary },
	specialtyText: { fontSize: 10, fontWeight: '500', color: colors.foregroundSecondary },
	workerServices: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
	workerServicesLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, color: colors.foregroundSecondary, marginBottom: 4 },
	workerServicesList: { fontSize: fontSize.xs, color: colors.foregroundSecondary, lineHeight: 18 },

	// Reviews
	reviewSummary: { flexDirection: 'row', gap: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
	reviewSummaryLeft: { alignItems: 'center', justifyContent: 'center' },
	reviewAvg: { fontSize: fontSize['3xl'], fontWeight: '700', color: colors.foreground, letterSpacing: -1 },
	starsRow: { flexDirection: 'row', gap: 1, marginTop: 2 },
	reviewCount: { fontSize: fontSize.xs, color: colors.foregroundSecondary, marginTop: 4 },
	reviewBars: { flex: 1, gap: 4, justifyContent: 'center' },
	barRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	barLabel: { width: 10, fontSize: fontSize.xs, color: colors.foregroundSecondary, textAlign: 'right' },
	barTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.surfaceSecondary, overflow: 'hidden' },
	barFill: { height: '100%', borderRadius: 3, backgroundColor: '#F59E0B' },
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

	// Hours
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

	// Contact
	contactCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md },
	contactRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
	contactText: { fontSize: fontSize.sm, color: colors.foreground, flex: 1 },
	contactLink: { color: colors.primary },

	// Book Now
	bookNowBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: spacing.lg, paddingTop: spacing.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
	bookNowButton: { backgroundColor: colors.primary, height: 48, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
	bookNowText: { fontSize: fontSize.base, fontWeight: '600', color: colors.white },

	// Empty
	emptyState: { alignItems: 'center', paddingVertical: spacing['5xl'], gap: spacing.sm },
	emptyTitle: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foregroundSecondary },
})
