import { supabase } from './supabase'

function getFileExtension(uri: string): string {
	const parts = uri.split('.')
	const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : 'jpg'
	// Strip query params if present
	return ext.split('?')[0] || 'jpg'
}

function getMimeType(ext: string): string {
	switch (ext) {
		case 'png': return 'image/png'
		case 'webp': return 'image/webp'
		default: return 'image/jpeg'
	}
}

export async function uploadBusinessPhoto(businessId: string, uri: string): Promise<string> {
	const ext = getFileExtension(uri)
	const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
	const path = `${businessId}/${fileName}`

	// Fetch image as blob
	const response = await fetch(uri)
	const blob = await response.blob()
	const arrayBuffer = await blob.arrayBuffer()

	const { error } = await supabase.storage
		.from('business-photos')
		.upload(path, arrayBuffer, {
			contentType: getMimeType(ext),
			cacheControl: '3600',
			upsert: false,
		})

	if (error) throw new Error(`Upload failed: ${error.message}`)

	const { data } = supabase.storage.from('business-photos').getPublicUrl(path)
	return data.publicUrl
}

export async function deleteBusinessPhoto(url: string): Promise<void> {
	const match = url.match(/\/business-photos\/(.+)$/)
	if (!match) throw new Error('Invalid photo URL')

	const { error } = await supabase.storage
		.from('business-photos')
		.remove([match[1]])

	if (error) throw new Error(`Delete failed: ${error.message}`)
}
