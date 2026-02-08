import type { ReactNode } from 'react'
import Animated, { FadeIn } from 'react-native-reanimated'

export function AnimatedScreen({ children }: { children: ReactNode }) {
	return (
		<Animated.View entering={FadeIn.duration(250)} style={{ flex: 1 }}>
			{children}
		</Animated.View>
	)
}
