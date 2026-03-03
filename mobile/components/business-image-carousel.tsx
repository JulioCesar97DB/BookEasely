import { Ionicons } from '@expo/vector-icons'
import { useCallback, useMemo, useState } from 'react'
import {
	Image,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native'
import ImageViewing from 'react-native-image-viewing'
import { colors, radius } from '../lib/theme'

interface Props {
	images: string[]
	height: number
	width: number
	onPress?: () => void
}

export function BusinessImageCarousel({ images, height, width, onPress }: Props) {
	const [activeIndex, setActiveIndex] = useState(0)
	const [viewerVisible, setViewerVisible] = useState(false)
	const [viewerIndex, setViewerIndex] = useState(0)

	const viewerImages = useMemo(
		() => images.map((uri) => ({ uri })),
		[images],
	)

	const onMomentumScrollEnd = useCallback(
		(e: NativeSyntheticEvent<NativeScrollEvent>) => {
			const index = Math.round(e.nativeEvent.contentOffset.x / width)
			setActiveIndex(index)
		},
		[width],
	)

	const handleImagePress = useCallback(
		(index: number) => {
			if (onPress) {
				onPress()
			} else {
				setViewerIndex(index)
				setViewerVisible(true)
			}
		},
		[onPress],
	)

	// No images — placeholder
	if (images.length === 0) {
		return (
			<Pressable onPress={onPress} style={[styles.placeholder, { height, width }]}>
				<Ionicons name="storefront-outline" size={28} color={colors.border} />
			</Pressable>
		)
	}

	// Single image — no carousel
	if (images.length === 1) {
		return (
			<>
				<Pressable onPress={() => handleImagePress(0)} style={{ height, width, backgroundColor: colors.surfaceSecondary }}>
					<Image
						source={{ uri: images[0] }}
						style={{ width, height, resizeMode: 'cover' }}
					/>
				</Pressable>
				<ImageViewing
					images={viewerImages}
					imageIndex={0}
					visible={viewerVisible}
					onRequestClose={() => setViewerVisible(false)}
				/>
			</>
		)
	}

	// Multiple images — carousel with dots
	return (
		<View style={{ height, width }}>
			<ScrollView
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onMomentumScrollEnd={onMomentumScrollEnd}
				scrollEventThrottle={16}
				nestedScrollEnabled
			>
				{images.map((url, i) => (
					<Pressable key={`${url}-${i}`} onPress={() => handleImagePress(i)}>
						<View style={{ width, height, backgroundColor: colors.surfaceSecondary }}>
							<Image
								source={{ uri: url }}
								style={{ width, height, resizeMode: 'cover' }}
							/>
						</View>
					</Pressable>
				))}
			</ScrollView>
			<View style={styles.dots} pointerEvents="none">
				{images.map((_, i) => (
					<View
						key={i}
						style={[
							styles.dot,
							i === activeIndex ? styles.dotActive : styles.dotInactive,
						]}
					/>
				))}
			</View>
			<ImageViewing
				images={viewerImages}
				imageIndex={viewerIndex}
				visible={viewerVisible}
				onRequestClose={() => setViewerVisible(false)}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	placeholder: {
		backgroundColor: colors.surfaceSecondary,
		justifyContent: 'center',
		alignItems: 'center',
	},
	dots: {
		position: 'absolute',
		bottom: 8,
		left: 0,
		right: 0,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 5,
	},
	dot: {
		borderRadius: radius.full,
	},
	dotActive: {
		width: 16,
		height: 5,
		backgroundColor: colors.white,
		borderRadius: 3,
	},
	dotInactive: {
		width: 5,
		height: 5,
		backgroundColor: 'rgba(255,255,255,0.5)',
	},
})
