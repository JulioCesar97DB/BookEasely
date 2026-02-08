import { createClient } from './client'

function getFileExtension(file: File): string {
	const parts = file.name.split('.')
	return parts.length > 1 ? parts.pop()!.toLowerCase() : 'jpg'
}

export async function uploadBusinessPhoto(businessId: string, file: File): Promise<string> {
	const supabase = createClient()
	const ext = getFileExtension(file)
	const fileName = `${crypto.randomUUID()}.${ext}`
	const path = `${businessId}/${fileName}`

	const { error } = await supabase.storage
		.from('business-photos')
		.upload(path, file, {
			cacheControl: '3600',
			upsert: false,
		})

	if (error) throw new Error(`Upload failed: ${error.message}`)

	const { data } = supabase.storage.from('business-photos').getPublicUrl(path)
	return data.publicUrl
}

export async function deleteBusinessPhoto(url: string): Promise<void> {
	const supabase = createClient()

	// Extract path from public URL: .../storage/v1/object/public/business-photos/{path}
	const match = url.match(/\/business-photos\/(.+)$/)
	if (!match) throw new Error('Invalid photo URL')

	const { error } = await supabase.storage
		.from('business-photos')
		.remove([match[1]])

	if (error) throw new Error(`Delete failed: ${error.message}`)
}
