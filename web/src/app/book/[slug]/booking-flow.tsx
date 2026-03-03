'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { createBooking, getAvailableSlots, getAvailableSlotsAnyWorker } from '@/lib/booking/actions'
import type { TimeSlot } from '@/lib/booking/time-slots'
import { formatDuration, formatTime, getInitials } from '@/lib/format'
import type { BusinessWithCategory, Service, Worker } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
	ArrowLeft,
	Calendar as CalendarIcon,
	Check,
	CheckCircle2,
	Clock,
	Loader2,
	Shuffle,
	User,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

type Step = 'service' | 'worker' | 'datetime' | 'confirm'
const STEPS: Step[] = ['service', 'worker', 'datetime', 'confirm']

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

	// Build service → workers map
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
			<div className="mx-auto max-w-lg px-4 py-16 text-center">
				<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
					<CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
				</div>
				<h1 className="mt-6 text-2xl font-bold">Booking {business.auto_confirm ? 'Confirmed' : 'Requested'}!</h1>
				<p className="mt-2 text-muted-foreground">
					{business.auto_confirm
						? 'Your appointment has been confirmed. You\'ll receive a confirmation soon.'
						: 'Your booking request has been sent. The business will confirm it shortly.'}
				</p>
				<div className="mt-6 rounded-lg border bg-card p-4 text-left text-sm space-y-2">
					<div className="flex justify-between">
						<span className="text-muted-foreground">Business</span>
						<span className="font-medium">{business.name}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Service</span>
						<span className="font-medium">{selectedService?.name}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Worker</span>
						<span className="font-medium">{resolvedWorkerName}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Date</span>
						<span className="font-medium">
							{selectedDate?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Time</span>
						<span className="font-medium">
							{selectedSlot && `${formatTime(selectedSlot.start)} - ${formatTime(selectedSlot.end)}`}
						</span>
					</div>
				</div>
				<div className="mt-6 flex gap-3 justify-center">
					<Button asChild variant="outline">
						<Link href={`/business/${business.slug}`}>Back to Business</Link>
					</Button>
					<Button asChild>
						<Link href="/dashboard/bookings">View My Bookings</Link>
					</Button>
				</div>
			</div>
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
				{/* Progress */}
				<div className="mt-4 flex items-center gap-2">
					{STEPS.map((s, i) => (
						<div key={s} className="flex items-center gap-2">
							<div
								className={cn(
									'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors',
									i < currentStepIndex
										? 'bg-primary text-primary-foreground'
										: i === currentStepIndex
											? 'bg-primary text-primary-foreground'
											: 'bg-muted text-muted-foreground'
								)}
							>
								{i < currentStepIndex ? <Check className="h-3.5 w-3.5" /> : i + 1}
							</div>
							{i < STEPS.length - 1 && (
								<div className={cn(
									'h-0.5 w-8 sm:w-12',
									i < currentStepIndex ? 'bg-primary' : 'bg-muted'
								)} />
							)}
						</div>
					))}
				</div>
			</div>

			{/* Step Content */}
			{step === 'service' && (
				<div className="space-y-3">
					<h2 className="text-lg font-semibold">Select a Service</h2>
					{services.map((service) => (
						<Card
							key={service.id}
							className="cursor-pointer transition-all hover:border-primary/40 hover:shadow-sm py-0"
							onClick={() => handleSelectService(service)}
						>
							<CardContent className="flex items-center justify-between p-4">
								<div className="flex-1 min-w-0">
									<h3 className="font-medium text-sm">{service.name}</h3>
									{service.description && (
										<p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{service.description}</p>
									)}
									<div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
										<span className="flex items-center gap-1">
											<Clock className="h-3 w-3" />
											{formatDuration(service.duration_minutes)}
										</span>
									</div>
								</div>
								<span className="text-sm font-semibold ml-4">${Number(service.price).toFixed(0)}</span>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{step === 'worker' && (
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">Select a Professional</h2>
						<Button variant="ghost" size="sm" onClick={handleBack}>
							<ArrowLeft className="h-4 w-4 mr-1" />
							Back
						</Button>
					</div>
					<p className="text-sm text-muted-foreground">
						For: {selectedService?.name} ({formatDuration(selectedService?.duration_minutes ?? 0)})
					</p>
					{availableWorkers.length === 0 ? (
						<Card>
							<CardContent className="py-12 text-center">
								<User className="h-8 w-8 mx-auto text-muted-foreground/40" />
								<p className="mt-3 text-sm text-muted-foreground">No professionals available for this service</p>
							</CardContent>
						</Card>
					) : (
						<>
							{availableWorkers.length > 1 && (
								<Card
									className="cursor-pointer transition-all hover:border-primary/40 hover:shadow-sm py-0 border-dashed"
									onClick={handleSelectAnyWorker}
								>
									<CardContent className="flex items-center gap-3 p-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
											<Shuffle className="h-5 w-5 text-primary" />
										</div>
										<div className="flex-1 min-w-0">
											<h3 className="font-medium text-sm">Any available professional</h3>
											<p className="text-xs text-muted-foreground">We&apos;ll pick whoever has the best availability</p>
										</div>
									</CardContent>
								</Card>
							)}
							{availableWorkers.map((worker) => (
								<Card
									key={worker.id}
									className="cursor-pointer transition-all hover:border-primary/40 hover:shadow-sm py-0"
									onClick={() => handleSelectWorker(worker)}
								>
									<CardContent className="flex items-center gap-3 p-4">
										<Avatar className="h-10 w-10">
											<AvatarImage src={worker.avatar_url ?? undefined} />
											<AvatarFallback className="text-xs">{getInitials(worker.display_name)}</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<h3 className="font-medium text-sm">{worker.display_name}</h3>
											{worker.bio && (
												<p className="text-xs text-muted-foreground line-clamp-1">{worker.bio}</p>
											)}
											{worker.specialties && worker.specialties.length > 0 && (
												<div className="flex gap-1 mt-1 flex-wrap">
													{worker.specialties.slice(0, 3).map((s) => (
														<Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">
															{s}
														</Badge>
													))}
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							))}
						</>
					)}
				</div>
			)}

			{step === 'datetime' && (
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">Select Date & Time</h2>
						<Button variant="ghost" size="sm" onClick={handleBack}>
							<ArrowLeft className="h-4 w-4 mr-1" />
							Back
						</Button>
					</div>
					<p className="text-sm text-muted-foreground">
						{selectedService?.name} with {anyWorkerMode ? 'any available professional' : selectedWorker?.display_name}
					</p>

					<div className="grid gap-6 lg:grid-cols-2">
						<Card className="py-0">
							<CardContent className="p-4">
								<Calendar
									mode="single"
									selected={selectedDate}
									onSelect={handleSelectDate}
									disabled={(date) => {
										const today = new Date()
										today.setHours(0, 0, 0, 0)
										return date < today
									}}
									className="rounded-md"
								/>
							</CardContent>
						</Card>

						<div>
							{!selectedDate && (
								<Card>
									<CardContent className="py-12 text-center">
										<CalendarIcon className="h-8 w-8 mx-auto text-muted-foreground/40" />
										<p className="mt-3 text-sm text-muted-foreground">Select a date to see available times</p>
									</CardContent>
								</Card>
							)}
							{selectedDate && loadingSlots && (
								<Card>
									<CardContent className="py-12 text-center">
										<Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" />
										<p className="mt-3 text-sm text-muted-foreground">Loading available times...</p>
									</CardContent>
								</Card>
							)}
							{selectedDate && !loadingSlots && availableSlots.length === 0 && (
								<Card>
									<CardContent className="py-12 text-center">
										<Clock className="h-8 w-8 mx-auto text-muted-foreground/40" />
										<p className="mt-3 text-sm text-muted-foreground">No available times on this date</p>
										<p className="mt-1 text-xs text-muted-foreground">Try selecting a different date</p>
									</CardContent>
								</Card>
							)}
							{selectedDate && !loadingSlots && availableSlots.length > 0 && (
								<div className="space-y-2">
									<p className="text-sm font-medium">
										{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
									</p>
									<div className="grid grid-cols-3 gap-2">
										{availableSlots.map((slot) => (
											<Button
												key={slot.start}
												variant={selectedSlot?.start === slot.start ? 'default' : 'outline'}
												size="sm"
												className="text-xs"
												onClick={() => handleSelectSlot(slot)}
											>
												{formatTime(slot.start)}
											</Button>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{step === 'confirm' && selectedService && (selectedWorker || anyWorkerMode) && selectedDate && selectedSlot && (
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">Confirm Booking</h2>
						<Button variant="ghost" size="sm" onClick={handleBack}>
							<ArrowLeft className="h-4 w-4 mr-1" />
							Back
						</Button>
					</div>

					<Card className="py-0">
						<CardContent className="p-5 space-y-4">
							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Business</span>
									<span className="text-sm font-medium">{business.name}</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Service</span>
									<span className="text-sm font-medium">{selectedService.name}</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Professional</span>
									<div className="flex items-center gap-2">
										{selectedWorker ? (
											<Avatar className="h-5 w-5">
												<AvatarImage src={selectedWorker.avatar_url ?? undefined} />
												<AvatarFallback className="text-[8px]">{getInitials(selectedWorker.display_name)}</AvatarFallback>
											</Avatar>
										) : (
											<div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
												<Shuffle className="h-3 w-3 text-primary" />
											</div>
										)}
										<span className="text-sm font-medium">{resolvedWorkerName}</span>
									</div>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Date</span>
									<span className="text-sm font-medium">
										{selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Time</span>
									<span className="text-sm font-medium">
										{formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Duration</span>
									<span className="text-sm font-medium">{formatDuration(selectedService.duration_minutes)}</span>
								</div>
								<div className="flex justify-between items-center border-t pt-3">
									<span className="text-sm font-medium">Total</span>
									<span className="text-lg font-bold">${Number(selectedService.price).toFixed(2)}</span>
								</div>
							</div>
						</CardContent>
					</Card>

					<div>
						<label className="text-sm font-medium">Note (optional)</label>
						<Textarea
							placeholder="Any special requests or notes for the appointment..."
							value={note}
							onChange={(e) => setNote(e.target.value)}
							className="mt-1.5"
							rows={3}
						/>
					</div>

					{business.cancellation_policy && (
						<p className="text-xs text-muted-foreground">
							Cancellation policy: {business.cancellation_policy}.
							{business.cancellation_hours > 0 && ` Cancel at least ${business.cancellation_hours}h in advance.`}
						</p>
					)}

					<Button
						className="w-full"
						size="lg"
						onClick={handleConfirm}
						disabled={isPending}
					>
						{isPending ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
								Booking...
							</>
						) : (
							`Confirm Booking - $${Number(selectedService.price).toFixed(0)}`
						)}
					</Button>
				</div>
			)}
		</div>
	)
}
