'use client'

import { updateBusinessPhotos } from '@/app/dashboard/business/actions'
import { deleteBusinessPhoto, uploadBusinessPhoto } from '@/lib/supabase/storage'
import { ImagePlus, Loader2, X } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

const MAX_PHOTOS = 10

interface Props {
	businessId: string
	initialPhotos: string[]
}

export function BusinessPhotoUpload({ businessId, initialPhotos }: Props) {
	const [photos, setPhotos] = useState<string[]>(initialPhotos)
	const [uploading, setUploading] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	async function handleFiles(files: FileList | null) {
		if (!files || files.length === 0) return

		const remaining = MAX_PHOTOS - photos.length
		if (remaining <= 0) {
			toast.error(`Maximum ${MAX_PHOTOS} photos allowed`)
			return
		}

		const toUpload = Array.from(files).slice(0, remaining)
		setUploading(true)

		try {
			const uploaded: string[] = []
			for (const file of toUpload) {
				if (!file.type.startsWith('image/')) continue
				if (file.size > 5 * 1024 * 1024) {
					toast.error(`${file.name} exceeds 5MB limit`)
					continue
				}
				const url = await uploadBusinessPhoto(businessId, file)
				uploaded.push(url)
			}

			if (uploaded.length > 0) {
				const updated = [...photos, ...uploaded]
				const result = await updateBusinessPhotos(businessId, updated)
				if (result.error) {
					toast.error(result.error)
				} else {
					setPhotos(updated)
					toast.success(`${uploaded.length} photo${uploaded.length > 1 ? 's' : ''} uploaded`)
				}
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Upload failed')
		} finally {
			setUploading(false)
			if (inputRef.current) inputRef.current.value = ''
		}
	}

	async function handleDelete(url: string) {
		try {
			await deleteBusinessPhoto(url)
			const updated = photos.filter((p) => p !== url)
			const result = await updateBusinessPhotos(businessId, updated)
			if (result.error) {
				toast.error(result.error)
			} else {
				setPhotos(updated)
				toast.success('Photo removed')
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Delete failed')
		}
	}

	function handleDrop(e: React.DragEvent) {
		e.preventDefault()
		handleFiles(e.dataTransfer.files)
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium">Business Photos</p>
					<p className="text-xs text-muted-foreground">
						Add up to {MAX_PHOTOS} photos. Drag & drop or click to upload.
					</p>
				</div>
				<p className="text-xs text-muted-foreground">
					{photos.length}/{MAX_PHOTOS}
				</p>
			</div>

			<div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
				{photos.map((url) => (
					<div
						key={url}
						className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
					>
						<Image
							src={url}
							alt="Business photo"
							fill
							sizes="120px"
							className="object-cover"
						/>
						<button
							type="button"
							onClick={() => handleDelete(url)}
							className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
						>
							<X className="h-3.5 w-3.5" />
						</button>
					</div>
				))}

				{photos.length < MAX_PHOTOS && (
					<button
						type="button"
						onClick={() => inputRef.current?.click()}
						onDrop={handleDrop}
						onDragOver={(e) => e.preventDefault()}
						disabled={uploading}
						className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary/40 hover:bg-muted disabled:opacity-50"
					>
						{uploading ? (
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						) : (
							<ImagePlus className="h-6 w-6 text-muted-foreground" />
						)}
					</button>
				)}
			</div>

			<input
				ref={inputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp"
				multiple
				className="hidden"
				onChange={(e) => handleFiles(e.target.files)}
			/>
		</div>
	)
}
