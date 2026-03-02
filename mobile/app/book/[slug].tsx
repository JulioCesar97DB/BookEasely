import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
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
import { createBooking, formatDuration, formatTime, getAvailableSlots, type TimeSlot } from '../../lib/booking'
import { supabase } from '../../lib/supabase'
import { colors, fontSize, radius, spacing } from '../../lib/theme'
import type { Service, Worker } from '../../lib/types'

type Step = 'service' | 'worker' | 'datetime' | 'confirm' | 'success'

function getInitials(name: string) {
	return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

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
	const [note, setNote] = useState('')
	const [submitting, setSubmitting] = useState(false)

	useEffect(() => {
		if (!user) { router.replace('/(auth)/login'); return }
		async function load() {
			const { data: biz } = await supabase
				.from('businesses').select('id, name, auto_confirm').eq('slug', slug).eq('is_active', true).single()
			if (!biz) { setIsLoading(false); return }
			setBusinessId(biz.id)
			setBusinessName(biz.name)
			setAutoConfirm(biz.auto_confirm)

			const [svc, wrk, sw] = await Promise.all([
				supabase.from('services').select('*').eq('business_id', biz.id).eq('is_active', true).order('price'),
				supabase.from('workers').select('*').eq('business_id', biz.id).eq('is_active', true).order('display_name'),
				supabase.from('service_workers').select('service_id, worker_id'),
			])
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

	// Generate date options (next 14 days)
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
		if (!businessId || !selectedService || !selectedWorker) return
		setSelectedDate(date)
		setSelectedSlot(null)
		setLoadingSlots(true)
		const slots = await getAvailableSlots({
			businessId, serviceId: selectedService.id, workerId: selectedWorker.id, date,
		})
		setAvailableSlots(slots)
		setLoadingSlots(false)
	}, [businessId, selectedService, selectedWorker])

	const handleConfirm = useCallback(async () => {
		if (!businessId || !selectedService || !selectedWorker || !selectedDate || !selectedSlot) return
		setSubmitting(true)
		const result = await createBooking({
			businessId, serviceId: selectedService.id, workerId: selectedWorker.id,
			date: selectedDate, startTime: selectedSlot.start, endTime: selectedSlot.end,
			note: note || undefined,
		})
		setSubmitting(false)
		if (result.error) {
			Alert.alert('Error', result.error)
		} else {
			setStep('success')
		}
	}, [businessId, selectedService, selectedWorker, selectedDate, selectedSlot, note])

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
				<View style={styles.successContainer}>
					<View style={styles.successIcon}>
						<Ionicons name="checkmark-circle" size={64} color={colors.success} />
					</View>
					<Text style={styles.successTitle}>
						Booking {autoConfirm ? 'Confirmed' : 'Requested'}!
					</Text>
					<Text style={styles.successSubtitle}>
						{autoConfirm
							? 'Your appointment has been confirmed.'
							: 'The business will confirm your booking shortly.'}
					</Text>
					<View style={styles.summaryCard}>
						<SummaryRow label="Business" value={businessName} />
						<SummaryRow label="Service" value={selectedService?.name ?? ''} />
						<SummaryRow label="Professional" value={selectedWorker?.display_name ?? ''} />
						<SummaryRow label="Date" value={selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''} />
						<SummaryRow label="Time" value={selectedSlot ? `${formatTime(selectedSlot.start)} - ${formatTime(selectedSlot.end)}` : ''} />
					</View>
					<TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/(tabs)/bookings')} activeOpacity={0.8}>
						<Text style={styles.primaryButtonText}>View My Bookings</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
						<Text style={styles.linkText}>Back to Business</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={styles.container} edges={['top']}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => step === 'service' ? router.back() : setStep(step === 'worker' ? 'service' : step === 'datetime' ? 'worker' : 'datetime')} style={styles.backBtn}>
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
					<>
						<Text style={styles.stepTitle}>Select a Service</Text>
						{services.map((service) => (
							<TouchableOpacity
								key={service.id}
								style={styles.optionCard}
								activeOpacity={0.7}
								onPress={() => { setSelectedService(service); setSelectedWorker(null); setSelectedDate(null); setSelectedSlot(null); setStep('worker') }}
							>
								<View style={styles.optionInfo}>
									<Text style={styles.optionName}>{service.name}</Text>
									{service.description && <Text style={styles.optionDesc} numberOfLines={1}>{service.description}</Text>}
									<View style={styles.optionMeta}>
										<Ionicons name="time-outline" size={12} color={colors.foregroundSecondary} />
										<Text style={styles.optionMetaText}>{formatDuration(service.duration_minutes)}</Text>
									</View>
								</View>
								<Text style={styles.optionPrice}>${Number(service.price).toFixed(0)}</Text>
							</TouchableOpacity>
						))}
					</>
				)}

				{step === 'worker' && (
					<>
						<Text style={styles.stepTitle}>Select a Professional</Text>
						<Text style={styles.stepSubtitle}>For: {selectedService?.name}</Text>
						{availableWorkers.map((worker) => (
							<TouchableOpacity
								key={worker.id}
								style={styles.optionCard}
								activeOpacity={0.7}
								onPress={() => { setSelectedWorker(worker); setSelectedDate(null); setSelectedSlot(null); setStep('datetime') }}
							>
								<View style={styles.workerRow}>
									<View style={styles.workerAvatar}>
										{worker.avatar_url ? (
											<Image source={{ uri: worker.avatar_url }} style={styles.workerAvatarImg} />
										) : (
											<Text style={styles.workerAvatarText}>{getInitials(worker.display_name)}</Text>
										)}
									</View>
									<View style={styles.optionInfo}>
										<Text style={styles.optionName}>{worker.display_name}</Text>
										{worker.bio && <Text style={styles.optionDesc} numberOfLines={1}>{worker.bio}</Text>}
									</View>
								</View>
							</TouchableOpacity>
						))}
					</>
				)}

				{step === 'datetime' && (
					<>
						<Text style={styles.stepTitle}>Select Date & Time</Text>
						<Text style={styles.stepSubtitle}>{selectedService?.name} with {selectedWorker?.display_name}</Text>

						{/* Date Chips */}
						<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateChips}>
							{dateOptions.map((d) => (
								<TouchableOpacity
									key={d.value}
									style={[styles.dateChip, selectedDate === d.value && styles.dateChipActive]}
									onPress={() => handleSelectDate(d.value)}
									activeOpacity={0.7}
								>
									<Text style={[styles.dateChipText, selectedDate === d.value && styles.dateChipTextActive]}>{d.label}</Text>
								</TouchableOpacity>
							))}
						</ScrollView>

						{/* Time Slots */}
						{!selectedDate && (
							<View style={styles.placeholderBox}>
								<Ionicons name="calendar-outline" size={32} color={colors.border} />
								<Text style={styles.placeholderText}>Select a date to see times</Text>
							</View>
						)}
						{selectedDate && loadingSlots && (
							<View style={styles.placeholderBox}>
								<ActivityIndicator size="small" color={colors.primary} />
								<Text style={styles.placeholderText}>Loading times...</Text>
							</View>
						)}
						{selectedDate && !loadingSlots && availableSlots.length === 0 && (
							<View style={styles.placeholderBox}>
								<Ionicons name="time-outline" size={32} color={colors.border} />
								<Text style={styles.placeholderText}>No available times</Text>
							</View>
						)}
						{selectedDate && !loadingSlots && availableSlots.length > 0 && (
							<View style={styles.slotsGrid}>
								{availableSlots.map((slot) => (
									<TouchableOpacity
										key={slot.start}
										style={[styles.slotChip, selectedSlot?.start === slot.start && styles.slotChipActive]}
										onPress={() => { setSelectedSlot(slot); setStep('confirm') }}
										activeOpacity={0.7}
									>
										<Text style={[styles.slotChipText, selectedSlot?.start === slot.start && styles.slotChipTextActive]}>
											{formatTime(slot.start)}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						)}
					</>
				)}

				{step === 'confirm' && selectedService && selectedWorker && selectedDate && selectedSlot && (
					<>
						<Text style={styles.stepTitle}>Confirm Booking</Text>
						<View style={styles.summaryCard}>
							<SummaryRow label="Business" value={businessName} />
							<SummaryRow label="Service" value={selectedService.name} />
							<SummaryRow label="Professional" value={selectedWorker.display_name} />
							<SummaryRow label="Date" value={new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} />
							<SummaryRow label="Time" value={`${formatTime(selectedSlot.start)} - ${formatTime(selectedSlot.end)}`} />
							<SummaryRow label="Duration" value={formatDuration(selectedService.duration_minutes)} />
							<View style={styles.summaryDivider} />
							<View style={styles.summaryRow}>
								<Text style={styles.summaryLabelBold}>Total</Text>
								<Text style={styles.summaryValueBold}>${Number(selectedService.price).toFixed(2)}</Text>
							</View>
						</View>

						<Text style={styles.noteLabel}>Note (optional)</Text>
						<TextInput
							style={styles.noteInput}
							placeholder="Special requests..."
							placeholderTextColor={colors.foregroundSecondary}
							value={note}
							onChangeText={setNote}
							multiline
						/>

						<TouchableOpacity
							style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
							onPress={handleConfirm}
							disabled={submitting}
							activeOpacity={0.8}
						>
							{submitting ? (
								<ActivityIndicator size="small" color={colors.white} />
							) : (
								<Text style={styles.primaryButtonText}>Confirm Booking - ${Number(selectedService.price).toFixed(0)}</Text>
							)}
						</TouchableOpacity>
					</>
				)}
			</ScrollView>
		</SafeAreaView>
	)
}

function SummaryRow({ label, value }: { label: string; value: string }) {
	return (
		<View style={styles.summaryRow}>
			<Text style={styles.summaryLabel}>{label}</Text>
			<Text style={styles.summaryValue}>{value}</Text>
		</View>
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
	stepTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.foreground, marginBottom: spacing.sm },
	stepSubtitle: { fontSize: fontSize.sm, color: colors.foregroundSecondary, marginBottom: spacing.lg },
	optionCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	optionInfo: { flex: 1 },
	optionName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.foreground },
	optionDesc: { fontSize: fontSize.xs, color: colors.foregroundSecondary, marginTop: 2 },
	optionMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
	optionMetaText: { fontSize: fontSize.xs, color: colors.foregroundSecondary },
	optionPrice: { fontSize: fontSize.base, fontWeight: '600', color: colors.foreground, marginLeft: spacing.md },
	workerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
	workerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center' },
	workerAvatarImg: { width: 40, height: 40, borderRadius: 20 },
	workerAvatarText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.foregroundSecondary },
	dateChips: { gap: spacing.sm, paddingVertical: spacing.md },
	dateChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
	dateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
	dateChipText: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foreground },
	dateChipTextActive: { color: colors.white },
	placeholderBox: { alignItems: 'center', paddingVertical: spacing['5xl'], gap: spacing.sm },
	placeholderText: { fontSize: fontSize.sm, color: colors.foregroundSecondary },
	slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
	slotChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
	slotChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
	slotChipText: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foreground },
	slotChipTextActive: { color: colors.white },
	summaryCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.lg },
	summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
	summaryLabel: { fontSize: fontSize.sm, color: colors.foregroundSecondary },
	summaryValue: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foreground },
	summaryLabelBold: { fontSize: fontSize.sm, fontWeight: '600', color: colors.foreground },
	summaryValueBold: { fontSize: fontSize.lg, fontWeight: '700', color: colors.foreground },
	summaryDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
	noteLabel: { fontSize: fontSize.sm, fontWeight: '500', color: colors.foreground, marginBottom: spacing.xs },
	noteInput: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, fontSize: fontSize.sm, color: colors.foreground, minHeight: 80, textAlignVertical: 'top', marginBottom: spacing.lg },
	primaryButton: { backgroundColor: colors.primary, height: 48, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg },
	primaryButtonDisabled: { opacity: 0.6 },
	primaryButtonText: { fontSize: fontSize.base, fontWeight: '600', color: colors.white },
	linkText: { fontSize: fontSize.sm, color: colors.primary, textAlign: 'center', fontWeight: '500' },
	successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing['2xl'] },
	successIcon: { marginBottom: spacing.lg },
	successTitle: { fontSize: fontSize['2xl'], fontWeight: '700', color: colors.foreground, marginBottom: spacing.sm },
	successSubtitle: { fontSize: fontSize.sm, color: colors.foregroundSecondary, textAlign: 'center', marginBottom: spacing['2xl'] },
})
