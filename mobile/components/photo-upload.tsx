import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { deleteBusinessPhoto, uploadBusinessPhoto } from '../lib/storage'
import { colors, fontSize, radius, spacing } from '../lib/theme'

const MAX_PHOTOS = 10

interface Props {
	businessId: string
	photos: string[]
	onPhotosChange: (photos: string[]) => void
}

export function PhotoUpload({ businessId, photos, onPhotosChange }: Props) {
	const [uploading, setUploading] = useState(false)

	async function handleAdd() {
		if (photos.length >= MAX_PHOTOS) {
			Alert.alert('Limit reached', `Maximum ${MAX_PHOTOS} photos allowed`)
			return
		}

		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
		if (status !== 'granted') {
			Alert.alert('Permission needed', 'Please grant photo library access to upload images')
			return
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			quality: 0.8,
			allowsMultipleSelection: true,
			selectionLimit: MAX_PHOTOS - photos.length,
		})

		if (result.canceled || result.assets.length === 0) return

		setUploading(true)
		try {
			const uploaded: string[] = []
			for (const asset of result.assets) {
				const url = await uploadBusinessPhoto(businessId, asset.uri)
				uploaded.push(url)
			}
			onPhotosChange([...photos, ...uploaded])
		} catch (err) {
			Alert.alert('Upload failed', err instanceof Error ? err.message : 'Unknown error')
		} finally {
			setUploading(false)
		}
	}

	async function handleDelete(url: string) {
		Alert.alert('Delete photo', 'Are you sure you want to remove this photo?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: async () => {
					try {
						await deleteBusinessPhoto(url)
						onPhotosChange(photos.filter((p) => p !== url))
					} catch (err) {
						Alert.alert('Error', err instanceof Error ? err.message : 'Delete failed')
					}
				},
			},
		])
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.label}>Business Photos</Text>
				<Text style={styles.count}>{photos.length}/{MAX_PHOTOS}</Text>
			</View>
			<Text style={styles.hint}>Add up to {MAX_PHOTOS} photos of your business</Text>

			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.scroll}
			>
				{photos.map((url) => (
					<View key={url} style={styles.thumbnail}>
						<Image source={{ uri: url }} style={styles.image} />
						<TouchableOpacity
							style={styles.deleteButton}
							onPress={() => handleDelete(url)}
							activeOpacity={0.7}
						>
							<Ionicons name="close" size={14} color={colors.white} />
						</TouchableOpacity>
					</View>
				))}

				{photos.length < MAX_PHOTOS && (
					<TouchableOpacity
						style={styles.addButton}
						onPress={handleAdd}
						disabled={uploading}
						activeOpacity={0.7}
					>
						{uploading ? (
							<ActivityIndicator size="small" color={colors.foregroundSecondary} />
						) : (
							<Ionicons name="add" size={28} color={colors.foregroundSecondary} />
						)}
					</TouchableOpacity>
				)}
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		gap: spacing.sm,
		marginBottom: spacing.lg,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	label: {
		fontSize: fontSize.sm,
		fontWeight: '500',
		color: colors.foreground,
	},
	count: {
		fontSize: fontSize.xs,
		color: colors.foregroundSecondary,
	},
	hint: {
		fontSize: fontSize.xs,
		color: colors.foregroundSecondary,
	},
	scroll: {
		gap: spacing.md,
		paddingVertical: spacing.sm,
	},
	thumbnail: {
		width: 100,
		height: 100,
		borderRadius: radius.md,
		overflow: 'hidden',
		backgroundColor: colors.surfaceSecondary,
	},
	image: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
	deleteButton: {
		position: 'absolute',
		top: 4,
		right: 4,
		width: 22,
		height: 22,
		borderRadius: 11,
		backgroundColor: 'rgba(0,0,0,0.6)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	addButton: {
		width: 100,
		height: 100,
		borderRadius: radius.md,
		borderWidth: 2,
		borderStyle: 'dashed',
		borderColor: colors.border,
		backgroundColor: colors.surfaceSecondary,
		justifyContent: 'center',
		alignItems: 'center',
	},
})
