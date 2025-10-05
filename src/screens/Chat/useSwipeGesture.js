import * as Haptics from 'expo-haptics'
import { useRef } from 'react'
import { Animated } from 'react-native'
import { State } from 'react-native-gesture-handler'

/**
 * Custom hook to handle swipe-to-delete gesture
 * @param {Object} params
 * @param {Function} params.onDelete - Callback function when delete is triggered
 * @returns {Object} Object containing translateX animation value and gesture handler
 */
export const useSwipeGesture = ({ onDelete }) => {
  const translateX = useRef(new Animated.Value(0)).current

  const handleSwipeGesture = (event) => {
    const { translationX, state } = event.nativeEvent

    if (state === State.ACTIVE) {
      // Only allow swipe to the left (negative translation)
      if (translationX < 0) {
        const clampedTranslation = Math.max(translationX, -120)
        translateX.setValue(clampedTranslation)
      }
    } else if (state === State.END || state === State.CANCELLED) {
      // Determine if swipe should trigger delete action
      if (translationX < -60) {
        // Trigger delete chat action
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        onDelete()
        // Reset swipe position
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8
        }).start()
      } else {
        // Close the swipe action
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8
        }).start()
      }
    }
  }

  return { translateX, handleSwipeGesture }
}
