'use client'

import { createBooking, getAvailableSlots, getAvailableSlotsAnyWorker } from '@/lib/booking/actions'
import type { TimeSlot } from '@/lib/booking/time-slots'
import type { BusinessWithCategory, Service, Worker } from '@/lib/types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { BookingProgress, type Step, STEPS } from './components/booking-progress'
import { BookingSuccess } from './components/booking-success'
import { StepConfirm } from './components/step-confirm'
import { StepDateTime } from './components/step-datetime'
import { StepService } from './components/step-service'
import { StepWorker } from './components/step-worker'

interface BookingFlowProps {
	business: BusinessWithCategory
	services: Service[]
	workers: Worker[]
	serviceWorkers: { service_id: string; worker_id: string }[]
}


export function BookingFlow({ business, services, workers, serviceWorkers }: BookingFlowProps) {
	const [step, setStep] = useState<Step>('service')
	const [selectedService, setSelectedService] = useState<Service | null>(null)
	const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
	const [anyWorkerMode, setAnyWorkerMode] = useState(false)
	const [slotWorkerMap, setSlotWorkerMap] = useState<Map<string, { workerId: string; workerName: string }>>(new Map())
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
	const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
	const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
	const [loadingSlots, setLoadingSlots] = useState(false)
	const [note, setNote] = useState('')
	const [bookingComplete, setBookingComplete] = useState(false)
	const [isPending, startTransition] = useTransition()

	const currentStepIndex = STEPS.indexOf(step)

	// Build service -> workers map
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
		const workerIds = serviceWorkerMap.get(selectedService.id) ?? []
		return workers.filter((w) => workerIds.includes(w.id))
	}, [selectedService, serviceWorkerMap, workers])

	const handleSelectService = (service: Service) => {
		setSelectedService(service)
		setSelectedWorker(null)
		setSelectedDate(undefined)
		setSelectedSlot(null)
		setStep('worker')
	}

	const handleSelectWorker = (worker: Worker) => {
		setSelectedWorker(worker)
		setAnyWorkerMode(false)
		setSelectedDate(undefined)
		setSelectedSlot(null)
		setSlotWorkerMap(new Map())
		setStep('datetime')
	}

	const handleSelectAnyWorker = () => {
		setSelectedWorker(null)
		setAnyWorkerMode(true)
		setSelectedDate(undefined)
		setSelectedSlot(null)
		setSlotWorkerMap(new Map())
		setStep('datetime')
	}

	const handleSelectDate = useCallback(async (date: Date | undefined) => {
		if (!date || !selectedService) return
		if (!anyWorkerMode && !selectedWorker) return
		setSelectedDate(date)
		setSelectedSlot(null)
		setLoadingSlots(true)

		const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`

		if (anyWorkerMode) {
			const result = await getAvailableSlotsAnyWorker({
				businessId: business.id,
				serviceId: selectedService.id,
				date: dateStr,
			})
			const map = new Map<string, { workerId: string; workerName: string }>()
			for (const slot of result.slots) {
				map.set(slot.start, { workerId: slot.workerId, workerName: slot.workerName })
			}
			setSlotWorkerMap(map)
			setAvailableSlots(result.slots)
		} else {
			const result = await getAvailableSlots({
				businessId: business.id,
				serviceId: selectedService.id,
				workerId: selectedWorker!.id,
				date: dateStr,
			})
			setAvailableSlots(result.slots)
		}

		setLoadingSlots(false)
	}, [selectedWorker, selectedService, business.id, anyWorkerMode])

	const handleSelectSlot = (slot: TimeSlot) => {
		setSelectedSlot(slot)
		setStep('confirm')
	}

	const handleBack = () => {
		const idx = currentStepIndex
		if (idx > 0) {
			setStep(STEPS[idx - 1])
		}
	}

	const resolvedWorkerId = anyWorkerMode && selectedSlot
		? slotWorkerMap.get(selectedSlot.start)?.workerId ?? ''
		: selectedWorker?.id ?? ''

	const resolvedWorkerName = anyWorkerMode && selectedSlot
		? slotWorkerMap.get(selectedSlot.start)?.workerName ?? 'Any available'
		: selectedWorker?.display_name ?? ''

	const handleConfirm = () => {
		if (!selectedService || !resolvedWorkerId || !selectedDate || !selectedSlot) return

		startTransition(async () => {
			const dateStr = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`

			const result = await createBooking({
				businessId: business.id,
				serviceId: selectedService.id,
				workerId: resolvedWorkerId,
				date: dateStr,
				startTime: selectedSlot.start,
				endTime: selectedSlot.end,
				note: note || undefined,
			})

			if (result.error) {
				toast.error(result.error)
			} else {
				setBookingComplete(true)
			}
		})
	}

	if (bookingComplete) {
		return (
			<BookingSuccess
				business={business}
				selectedService={selectedService}
				resolvedWorkerName={resolvedWorkerName}
				selectedDate={selectedDate}
				selectedSlot={selectedSlot}
			/>
		)
	}

	return (
		<div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
			{/* Header */}
			<div className="mb-8">
				<Link
					href={`/business/${business.slug}`}
					className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
				>
					<ArrowLeft className="h-4 w-4" />
					{business.name}
				</Link>
				<h1 className="text-2xl font-bold tracking-tight">Book an Appointment</h1>
				<BookingProgress currentStepIndex={currentStepIndex} />
			</div>

			{/* Step Content */}
			{step === 'service' && (
				<StepService services={services} onSelectService={handleSelectService} />
			)}

			{step === 'worker' && selectedService && (
				<StepWorker
					selectedService={selectedService}
					availableWorkers={availableWorkers}
					onSelectWorker={handleSelectWorker}
					onSelectAnyWorker={handleSelectAnyWorker}
					onBack={handleBack}
				/>
			)}

			{step === 'datetime' && selectedService && (
				<StepDateTime
					selectedService={selectedService}
					selectedWorker={selectedWorker}
					anyWorkerMode={anyWorkerMode}
					selectedDate={selectedDate}
					selectedSlot={selectedSlot}
					availableSlots={availableSlots}
					loadingSlots={loadingSlots}
					onSelectDate={handleSelectDate}
					onSelectSlot={handleSelectSlot}
					onBack={handleBack}
				/>
			)}

			{step === 'confirm' && selectedService && (selectedWorker || anyWorkerMode) && selectedDate && selectedSlot && (
				<StepConfirm
					business={business}
					selectedService={selectedService}
					selectedWorker={selectedWorker}
					anyWorkerMode={anyWorkerMode}
					resolvedWorkerName={resolvedWorkerName}
					selectedDate={selectedDate}
					selectedSlot={selectedSlot}
					note={note}
					isPending={isPending}
					onNoteChange={setNote}
					onConfirm={handleConfirm}
					onBack={handleBack}
				/>
			)}
		</div>
	)
}
