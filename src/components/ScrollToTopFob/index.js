import React, { useEffect } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'

const FOB_SIZE = 40

const ScrollToTopFob = ({ visible, onPress, theme }) => {
  const translateX = useSharedValue(80)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      translateX.value = withSpring(0, { damping: 18, stiffness: 120 })
      opacity.value = withSpring(1, { damping: 18, stiffness: 120 })
    } else {
      translateX.value = withTiming(80, { duration: 200 })
      opacity.value = withTiming(0, { duration: 200 })
    }
  }, [visible])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value
  }))

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Pressable
        onPress={onPress}
        style={[
          styles.button,
          {
            backgroundColor: theme.HEADER_BACKGROUND,
            shadowColor: theme.HEADER_SHADOW || '#000'
          }
        ]}
      >
        <Ionicons name='chevron-up' size={20} color={theme.TEXT_SECONDARY} />
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10
  },
  button: {
    width: FOB_SIZE,
    height: FOB_SIZE,
    borderRadius: FOB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4
  }
})

export default ScrollToTopFob
