import { Ionicons } from '@expo/vector-icons'
import { useCallback, useRef, useState } from 'react'
import {
	FlatList,
	Image,
	StyleSheet,
	View,
	type ViewToken,
} from 'react-native'
import { colors, radius } from '../lib/theme'

interface Props {
	images: string[]
	height: number
	width: number
}

export function BusinessImageCarousel({ images, height, width }: Props) {
	const [activeIndex, setActiveIndex] = useState(0)

	const onViewableItemsChanged = useCallback(
		({ viewableItems }: { viewableItems: ViewToken[] }) => {
			if (viewableItems.length > 0 && viewableItems[0].index != null) {
				setActiveIndex(viewableItems[0].index)
			}
		},
		[],
	)

	const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current

	// No images — placeholder
	if (images.length === 0) {
		return (
			<View style={[styles.placeholder, { height, width }]}>
				<Ionicons name="storefront-outline" size={28} color={colors.border} />
			</View>
		)
	}

	// Single image — no carousel
	if (images.length === 1) {
		return (
			<View style={{ height, width, backgroundColor: colors.surfaceSecondary }}>
				<Image
					source={{ uri: images[0] }}
					style={{ width, height, resizeMode: 'cover' }}
				/>
			</View>
		)
	}

	// Multiple images — carousel with dots
	return (
		<View style={{ height, width }}>
			<FlatList
				data={images}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onViewableItemsChanged={onViewableItemsChanged}
				viewabilityConfig={viewabilityConfig}
				keyExtractor={(item, i) => `${item}-${i}`}
				renderItem={({ item }) => (
					<View style={{ width, height, backgroundColor: colors.surfaceSecondary }}>
						<Image
							source={{ uri: item }}
							style={{ width, height, resizeMode: 'cover' }}
						/>
					</View>
				)}
			/>
			<View style={styles.dots}>
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
		backgroundColor: '#FFFFFF',
		borderRadius: 3,
	},
	dotInactive: {
		width: 5,
		height: 5,
		backgroundColor: 'rgba(255,255,255,0.5)',
	},
})
