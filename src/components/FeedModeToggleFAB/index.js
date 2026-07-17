import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { useAtom } from 'jotai'
import React from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'
import Animated, {
  useAnimatedStyle,
  interpolate
} from 'react-native-reanimated'

import * as STATE from '../../state'

const FAB_SIZE = 56
const HORIZONTAL_MARGIN = 16

const FeedModeToggleFAB = ({
  footerHeight,
  theme,
  onPress
}) => {
  const [isBookmarksMode, setIsBookmarksMode] = useAtom(STATE.isBookmarksMode)
  const { height: kbHeight } = useReanimatedKeyboardAnimation()

  const keyboardStyle = useAnimatedStyle(() => {
    const kbOpen = kbHeight.value < 0 ? 1 : 0
    return {
      bottom: interpolate(kbOpen, [0, 1], [footerHeight + HORIZONTAL_MARGIN, 8]),
      transform: [{ translateY: kbHeight.value }]
    }
  })

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setIsBookmarksMode((prev) => !prev)
    if (onPress) onPress()
  }

  return (
    <Animated.View
      style={[
        styles.wrapper,
        keyboardStyle
      ]}
    >
      <Pressable
        onPress={handlePress}
        style={[
          styles.fabButton,
          {
            backgroundColor: theme.INTERACTIVE_PRIMARY
          }
        ]}
      >
        <Ionicons
          name={isBookmarksMode ? 'bookmark-outline' : 'globe-outline'}
          size={22}
          color='white'
        />
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: HORIZONTAL_MARGIN,
    zIndex: 11
  },
  fabButton: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6
  }
})

export default FeedModeToggleFAB
