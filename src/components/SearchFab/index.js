import React, { useRef, useEffect } from 'react'
import { Pressable, TextInput, Keyboard, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate
} from 'react-native-reanimated'

const FAB_SIZE = 56
const HORIZONTAL_MARGIN = 16

const SearchFab = ({
  searchTerm,
  setSearchTerm,
  onSubmitSearch,
  onClearSearch,
  isExpanded,
  setIsExpanded,
  theme,
  footerHeight,
  screenWidth
}) => {
  const progress = useSharedValue(isExpanded ? 1 : 0)
  const inputRef = useRef(null)
  const expandedWidth = screenWidth - HORIZONTAL_MARGIN * 2
  const { height: kbHeight } = useReanimatedKeyboardAnimation()

  const wasExpanded = useRef(isExpanded)

  useEffect(() => {
    progress.value = withSpring(isExpanded ? 1 : 0, {
      damping: 18,
      stiffness: 120
    })
    // Only auto-focus on the transition from collapsed → expanded
    if (isExpanded && !wasExpanded.current) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
    wasExpanded.current = isExpanded
  }, [isExpanded])

  // Animated bar that expands behind the FAB
  const barStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [FAB_SIZE, expandedWidth]),
    opacity: interpolate(progress.value, [0, 0.3], [0, 1]),
    paddingLeft: interpolate(progress.value, [0, 1], [FAB_SIZE + 4, 16]),
    paddingRight: interpolate(progress.value, [0, 1], [16, FAB_SIZE + 4])
  }))

  // Input fades/slides in only when bar is mostly expanded
  const inputOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.4, 0.8], [0, 1]),
    width: progress.value > 0.3 ? 'auto' : 0
  }))

  // FAB button slides from left to right when expanding
  const fabPositionStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [0, expandedWidth - FAB_SIZE]) }]
  }))

  // Slide the whole FAB up when keyboard is visible
  // When keyboard is closed, kbHeight.value === 0 → bottom stays at footerHeight + 16
  // When keyboard is open, kbHeight.value is negative → translateY lifts the FAB,
  // and we shrink the bottom offset so it sits snug above the keyboard
  const keyboardStyle = useAnimatedStyle(() => {
    const kbOpen = kbHeight.value < 0 ? 1 : 0
    return {
      bottom: interpolate(kbOpen, [0, 1], [footerHeight + 16, 8]),
      transform: [{ translateY: kbHeight.value }]
    }
  })

  const canSubmit = searchTerm.length >= 3

  const handleFabPress = () => {
    if (isExpanded) {
      if (!canSubmit) return
      Keyboard.dismiss()
      onSubmitSearch()
    } else {
      setIsExpanded(true)
    }
  }

  return (
    <Animated.View
      style={[
        styles.wrapper,
        keyboardStyle
      ]}
      pointerEvents='box-none'
    >
      {/* Expanding search bar background */}
      <Animated.View
        style={[
          styles.bar,
          {
            backgroundColor: theme.HEADER_BACKGROUND,
            borderWidth: 1,
            borderColor: theme.BORDER_LIGHT,
            shadowColor: theme.HEADER_SHADOW
          },
          barStyle
        ]}
      >
        <Animated.View style={[styles.inputContainer, inputOpacity]}>
          <TextInput
            ref={inputRef}
            placeholder='Search photos...'
            placeholderTextColor={theme.TEXT_SECONDARY}
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={() => {
              if (searchTerm.length < 3) return
              Keyboard.dismiss()
              onSubmitSearch()
            }}
            returnKeyType='search'
            style={[styles.input, { color: theme.TEXT_PRIMARY }]}
          />
          {searchTerm.length > 0 && (
            <Pressable
              onPress={onClearSearch}
              style={[styles.clearButton, { backgroundColor: theme.INTERACTIVE_SECONDARY }]}
            >
              <Ionicons name='close' size={12} color={theme.TEXT_PRIMARY} />
            </Pressable>
          )}
        </Animated.View>
      </Animated.View>

      {/* FAB button — always on top, never clipped */}
      <Animated.View style={fabPositionStyle}>
        <Pressable
          onPress={handleFabPress}
          disabled={isExpanded && !canSubmit}
          style={[
            styles.fabButton,
            { backgroundColor: theme.INTERACTIVE_PRIMARY, opacity: isExpanded && !canSubmit ? 0.4 : 1 }
          ]}
        >
          <Ionicons
            name={isExpanded ? 'send' : 'search'}
            size={22}
            color='white'
          />
        </Pressable>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: HORIZONTAL_MARGIN,
    right: HORIZONTAL_MARGIN,
    height: FAB_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 10
  },
  bar: {
    position: 'absolute',
    left: 0,
    height: FAB_SIZE,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden'
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    height: 40,
    paddingHorizontal: 4
  },
  clearButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4
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
    shadowRadius: 6,
    zIndex: 11
  }
})

export default SearchFab
