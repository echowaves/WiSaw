import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { useAtom } from 'jotai'
import React from 'react'
import { Pressable, StyleSheet } from 'react-native'

import * as STATE from '../../state'

const FAB_SIZE = 56
const HORIZONTAL_MARGIN = 16

const FeedModeToggleFAB = ({
  footerHeight,
  theme,
  onPress
}) => {
  const [isBookmarksMode, setIsBookmarksMode] = useAtom(STATE.isBookmarksMode)

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setIsBookmarksMode((prev) => !prev)
    if (onPress) onPress()
  }

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.fabButton,
        {
          backgroundColor: theme.INTERACTIVE_PRIMARY,
          bottom: footerHeight + FAB_SIZE + 12 + HORIZONTAL_MARGIN
        }
      ]}
    >
      <Ionicons
        name={isBookmarksMode ? 'bookmark-outline' : 'globe-outline'}
        size={22}
        color='white'
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  fabButton: {
    position: 'absolute',
    right: HORIZONTAL_MARGIN,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 11
  }
})

export default FeedModeToggleFAB
