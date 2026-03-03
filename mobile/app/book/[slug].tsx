import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../lib/auth-context'
import { createBooking, getAvailableSlots, getAvailableSlotsAnyWorker, type TimeSlot } from '../../lib/booking'
import { handleSupabaseError } from '../../lib/handle-error'
import { supabase } from '../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../lib/theme'
import type { Service, Worker } from '../../lib/types'
import { ServiceStep } from '../../components/booking/service-step'
import { WorkerStep } from '../../components/booking/worker-step'
import { DateTimeStep } from '../../components/booking/datetime-step'
import { ConfirmStep } from '../../components/booking/confirm-step'
import { SuccessStep } from '../../components/booking/success-step'

type Step = 'service' | 'worker' | 'datetime' | 'confirm' | 'success'

export default function BookScreen() {
	const { slug } = useLocalSearchParams<{ slug: string }>()
	const router = useRouter()
	const { user } = useAuth()

	const [step, setStep] = useState<Step>('service')
	const [businessId, setBusinessId] = useState<string | null>(null)
	const [businessName, setBusinessName] = useState('')
	const [autoConfirm, setAutoConfirm] = useState(true)
	const [services, setServices] = useState<Service[]>([])
	const [workers, setWorkers] = useState<Worker[]>([])
	const [serviceWorkers, setServiceWorkers] = useState<{ service_id: string; worker_id: string }[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const [selectedService, setSelectedService] = useState<Service | null>(null)
	const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
	const [selectedDate, setSelectedDate] = useState<string | null>(null)
	const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
	const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
	const [loadingSlots, setLoadingSlots] = useState(false)
	const [anyWorkerMode, setAnyWorkerMode] = useState(false)
	const [slotWorkerMap, setSlotWorkerMap] = useState<Map<string, { workerId: string; workerName: string }>>(new Map())
	const [note, setNote] = useState('')
	const [submitting, setSubmitting] = useState(false)

	useEffect(() => {
		if (!user) { router.replace('/(auth)/login'); return }
		async function load() {
			const { data: biz, error: bizError } = await supabase
				.from('businesses').select('id, name, auto_confirm').eq('slug', slug).eq('is_active', true).single()
			if (handleSupabaseError(bizError, 'Loading business') || !biz) { setIsLoading(false); return }
			setBusinessId(biz.id)
			setBusinessName(biz.name)
			setAutoConfirm(biz.auto_confirm)

			const [svc, wrk, sw] = await Promise.all([
				supabase.from('services').select('*').eq('business_id', biz.id).eq('is_active', true).order('price'),
				supabase.from('workers').select('*').eq('business_id', biz.id).eq('is_active', true).order('display_name'),
				supabase.from('service_workers').select('service_id, worker_id'),
			])
			handleSupabaseError(svc.error, 'Loading services')
			handleSupabaseError(wrk.error, 'Loading workers')
			handleSupabaseError(sw.error, 'Loading service workers')
			setServices(svc.data ?? [])
			setWorkers(wrk.data ?? [])
			setServiceWorkers(sw.data ?? [])
			setIsLoading(false)
		}
		load()
	}, [slug, user, router])

	const serviceWorkerMap = useMemo(() => {
		const map = new Map<string, string[]>()
		for (const sw of serviceWorkers) {
			const arr = map.get(sw.service_id) ?? []
			arr.push(sw.worker_id)
			map.set(sw.service_id, arr)
		}
		return map
	}, [serviceWorkers])

	const availableWorkers = useMemo(() => {
		if (!selectedService) return []
		const ids = serviceWorkerMap.get(selectedService.id) ?? []
		return workers.filter((w) => ids.includes(w.id))
	}, [selectedService, serviceWorkerMap, workers])

	const dateOptions = useMemo(() => {
		const dates: { label: string; value: string }[] = []
		const now = new Date()
		for (let i = 0; i < 14; i++) {
			const d = new Date(now)
			d.setDate(d.getDate() + i)
			const val = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
			const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
			dates.push({ label, value: val })
		}
		return dates
	}, [])

	const handleSelectDate = useCallback(async (date: string) => {
		if (!businessId || !selectedService) return
		if (!anyWorkerMode && !selectedWorker) return
		setSelectedDate(date)
		setSelectedSlot(null)
		setLoadingSlots(true)

		try {
			if (anyWorkerMode) {
				const { slots } = await getAvailableSlotsAnyWorker({ businessId, serviceId: selectedService.id, date })
				const map = new Map<string, { workerId: string; workerName: string }>()
				const timeSlots: TimeSlot[] = []
				for (const slot of slots) {
					map.set(slot.start, { workerId: slot.workerId, workerName: slot.workerName })
					timeSlots.push({ start: slot.start, end: slot.end })
				}
				setSlotWorkerMap(map)
				setAvailableSlots(timeSlots)
			} else {
				const slots = await getAvailableSlots({
					businessId, serviceId: selectedService.id, workerId: selectedWorker!.id, date,
				})
				setAvailableSlots(slots)
			}
		} catch (err) {
			Alert.alert('Error', err instanceof Error ? err.message : 'Failed to load available time slots')
		} finally {
			setLoadingSlots(false)
		}
	}, [businessId, selectedService, selectedWorker, anyWorkerMode])

	const resolvedWorkerId = anyWorkerMode && selectedSlot
		? slotWorkerMap.get(selectedSlot.start)?.workerId ?? null
		: selectedWorker?.id ?? null
	const resolvedWorkerName = anyWorkerMode && selectedSlot
		? slotWorkerMap.get(selectedSlot.start)?.workerName ?? 'Available professional'
		: selectedWorker?.display_name ?? ''

	const handleConfirm = useCallback(async () => {
		if (!businessId || !selectedService || !resolvedWorkerId || !selectedDate || !selectedSlot) return
		setSubmitting(true)
		const result = await createBooking({
			businessId, serviceId: selectedService.id, workerId: resolvedWorkerId,
			date: selectedDate, startTime: selectedSlot.start, endTime: selectedSlot.end,
			note: note || undefined,
		})
		setSubmitting(false)
		if (result.error) {
			Alert.alert('Error', result.error)
		} else {
			setStep('success')
		}
	}, [businessId, selectedService, resolvedWorkerId, selectedDate, selectedSlot, note])

	const goBack = useCallback(() => {
		if (step === 'service') router.back()
		else if (step === 'worker') setStep('service')
		else if (step === 'datetime') setStep('worker')
		else setStep('datetime')
	}, [step, router])

	if (isLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
			</SafeAreaView>
		)
	}

	if (step === 'success') {
		return (
			<SafeAreaView style={styles.container} edges={['top', 'bottom']}>
				<SuccessStep
					autoConfirm={autoConfirm}
					businessName={businessName}
					selectedService={selectedService}
					resolvedWorkerName={resolvedWorkerName}
					selectedDate={selectedDate}
					selectedSlot={selectedSlot}
					onViewBookings={() => router.replace('/(tabs)/bookings')}
					onGoBack={() => router.back()}
				/>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={styles.container} edges={['top']}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={goBack} style={styles.backBtn}>
					<Ionicons name="chevron-back" size={22} color={colors.foreground} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Book Appointment</Text>
				<View style={{ width: 36 }} />
			</View>

			{/* Progress */}
			<View style={styles.progressRow}>
				{['service', 'worker', 'datetime', 'confirm'].map((s, i) => (
					<View key={s} style={styles.progressItem}>
						<View style={[styles.progressDot, (step === s || ['service', 'worker', 'datetime', 'confirm'].indexOf(step) > i) && styles.progressDotActive]} />
						{i < 3 && <View style={[styles.progressLine, ['service', 'worker', 'datetime', 'confirm'].indexOf(step) > i && styles.progressLineActive]} />}
					</View>
				))}
			</View>

			<ScrollView style={styles.content} contentContainerStyle={styles.contentPadding} showsVerticalScrollIndicator={false}>
				{step === 'service' && (
					<ServiceStep
						services={services}
						onSelect={(service) => { setSelectedService(service); setSelectedWorker(null); setSelectedDate(null); setSelectedSlot(null); setStep('worker') }}
					/>
				)}

				{step === 'worker' && selectedService && (
					<WorkerStep
						selectedService={selectedService}
						availableWorkers={availableWorkers}
						onSelectWorker={(worker) => { setAnyWorkerMode(false); setSelectedWorker(worker); setSelectedDate(null); setSelectedSlot(null); setStep('datetime') }}
						onSelectAny={() => { setAnyWorkerMode(true); setSelectedWorker(null); setSelectedDate(null); setSelectedSlot(null); setSlotWorkerMap(new Map()); setStep('datetime') }}
					/>
				)}

				{step === 'datetime' && selectedService && (
					<DateTimeStep
						selectedService={selectedService}
						selectedWorker={selectedWorker}
						anyWorkerMode={anyWorkerMode}
						dateOptions={dateOptions}
						selectedDate={selectedDate}
						loadingSlots={loadingSlots}
						availableSlots={availableSlots}
						selectedSlot={selectedSlot}
						onSelectDate={handleSelectDate}
						onSelectSlot={(slot) => { setSelectedSlot(slot); setStep('confirm') }}
					/>
				)}

				{step === 'confirm' && selectedService && resolvedWorkerId && selectedDate && selectedSlot && (
					<ConfirmStep
						businessName={businessName}
						selectedService={selectedService}
						resolvedWorkerName={resolvedWorkerName}
						selectedDate={selectedDate}
						selectedSlot={selectedSlot}
						note={note}
						onNoteChange={setNote}
						submitting={submitting}
						onConfirm={handleConfirm}
					/>
				)}
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
	backBtn: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
	headerTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.foreground },
	progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing['2xl'], paddingBottom: spacing.lg },
	progressItem: { flexDirection: 'row', alignItems: 'center' },
	progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border },
	progressDotActive: { backgroundColor: colors.primary },
	progressLine: { width: 40, height: 2, backgroundColor: colors.border, marginHorizontal: 4 },
	progressLineActive: { backgroundColor: colors.primary },
	content: { flex: 1 },
	contentPadding: { paddingHorizontal: spacing['2xl'], paddingBottom: spacing['5xl'] },
})
