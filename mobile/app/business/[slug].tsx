import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AnimatedScreen } from '../../components/animated-screen'
import { ProfileHero, type Tab } from '../../components/business-profile/profile-hero'
import { ServicesSection } from '../../components/business-profile/services-tab'
import { WorkersSection } from '../../components/business-profile/team-tab'
import { ReviewsSection, type ReviewWithProfile } from '../../components/business-profile/reviews-tab'
import { HoursSection } from '../../components/business-profile/hours-tab'
import { useAuth } from '../../lib/auth-context'
import { handleSupabaseError } from '../../lib/handle-error'
import { supabase } from '../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../lib/theme'
import type {
	BusinessHours,
	BusinessWithCategory,
	Service,
	Worker,
} from '../../lib/types'

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
			const { data: biz, error: bizError } = await supabase
				.from('businesses')
				.select('*, categories(name, slug)')
				.eq('slug', slug)
				.eq('is_active', true)
				.single()

			if (handleSupabaseError(bizError, 'Loading business') || !biz) {
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

			handleSupabaseError(svcRes.error, 'Loading services')
			handleSupabaseError(wrkRes.error, 'Loading workers')
			handleSupabaseError(swRes.error, 'Loading service workers')
			handleSupabaseError(hrsRes.error, 'Loading business hours')
			handleSupabaseError(revRes.error, 'Loading reviews')

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

	const handleBookNow = useCallback(() => {
		if (!user) {
			router.push('/(auth)/login')
			return
		}
		router.push(`/book/${slug}`)
	}, [user, router, slug])

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
					<ProfileHero
						business={business}
						hours={hours}
						images={images}
						activeTab={activeTab}
						onTabChange={setActiveTab}
					/>

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

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	scrollContent: { paddingBottom: 100 },
	loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	notFoundContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
	notFoundTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.foregroundSecondary },
	backButton: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginTop: spacing.md },
	backButtonText: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foreground },
	tabContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
	bookNowBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: spacing.lg, paddingTop: spacing.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
	bookNowButton: { backgroundColor: colors.primary, height: 48, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
	bookNowText: { fontSize: fontSize.base, fontWeight: '600', color: colors.white },
})
