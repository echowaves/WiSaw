import { Ionicons } from '@expo/vector-icons'
import { useAtom } from 'jotai'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import * as Haptics from 'expo-haptics'

import * as STATE from '../../state'
import { errorContextAtom, hideErrorAtom } from '../../atoms/errorAtom'
import { getTheme } from '../../theme/sharedStyles'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const MODAL_CORNER_RADIUS = 24
const SWIPE_THRESHOLD = -80

/**
 * ErrorDetailModal — bottom-sheet modal that slides up from the bottom
 * when a user taps an error toast. Dismissible by swipe-down, [Dismiss],
 * [✕], or backdrop tap.
 */
export default function ErrorDetailModal () {
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [errorContext, setErrorContext] = useAtom(errorContextAtom)
  const [stackExpanded, setStackExpanded] = useState(false)

  const theme = useMemo(() => getTheme(isDarkMode), [isDarkMode])
  const styles = useMemo(() => createStyles(theme), [theme])

  // Animation values
  const translateY = useSharedValue(SCREEN_HEIGHT)
  const backdropOpacity = useSharedValue(0)

  // Track if modal is currently visible for haptics
  const hasPlayedOpenHaptic = useRef(false)

  // Reset state when error changes
  useEffect(() => {
    if (errorContext.visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 130 })
      backdropOpacity.value = withTiming(1, { duration: 200 })
      hasPlayedOpenHaptic.current = false
      setStackExpanded(false)
    } else {
      translateY.value = withSpring(SCREEN_HEIGHT, { damping: 15, stiffness: 130 })
      backdropOpacity.value = withTiming(0, { duration: 200 })
    }
  }, [errorContext.visible, errorContext.title, errorContext.message, errorContext.stack])

  // Haptic on open
  useEffect(() => {
    if (errorContext.visible && !hasPlayedOpenHaptic.current) {
      hasPlayedOpenHaptic.current = true
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }
  }, [errorContext.visible])

  // Swipe-down gesture
  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .onUpdate((event) => {
        translateY.value = Math.max(0, event.translationY)
      })
      .onEnd((event) => {
        if (event.translationY < SWIPE_THRESHOLD) {
          dismiss()
        } else {
          translateY.value = withSpring(0, { damping: 15, stiffness: 130 })
        }
      })
      .minDistance(SWIPE_THRESHOLD)
  }, [])

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }))

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value
  }))

  const dismiss = useCallback(() => {
    translateY.value = withSpring(SCREEN_HEIGHT, { damping: 15, stiffness: 130 })
    backdropOpacity.value = withTiming(0, { duration: 200 })
    setTimeout(() => setErrorContext(hideErrorAtom), 300)
  }, [])

  const handleBackdropPress = useCallback(() => {
    dismiss()
  }, [dismiss])

  const handleStackLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setStackExpanded((prev) => !prev)
  }, [])

  if (!errorContext.visible) return null

  return (
    <Modal
      visible={errorContext.visible}
      transparent
      animationType='none'
      onRequestClose={dismiss}
    >
      <GestureHandlerRootView style={styles.root}>
        {/* Backdrop */}
        <Animated.View
          style={[styles.backdrop, animatedBackdropStyle]}
          pointerEvents='box-only'
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleBackdropPress}
            style={styles.backdropInner}
          />
        </Animated.View>

        {/* Modal Sheet */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.sheet, animatedModalStyle]}>
            {/* Handle bar */}
            <View style={styles.barContainer}>
              <View style={styles.bar} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Ionicons name='alert-circle' size={24} color={theme.STATUS_CAUTION} />
              <Text style={[styles.headerTitle, { color: theme.TEXT_PRIMARY }]} numberOfLines={2}>
                {errorContext.title}
              </Text>
              <TouchableOpacity
                onPress={dismiss}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.closeButton}
              >
                <Ionicons name='close' size={24} color={theme.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* Message */}
              <Text style={[styles.message, { color: theme.TEXT_SECONDARY }]}>
                {errorContext.message}
              </Text>

              {/* Stack Trace */}
              {errorContext.stack
                ? (
                  <TouchableOpacity
                    onPressIn={handleStackLongPress}
                    activeOpacity={0.7}
                    style={styles.stackContainer}
                  >
                    <Text style={[styles.stackHint, { color: theme.TEXT_DISABLED }]}>
                      {stackExpanded ? '▼ Stack Trace (tap to collapse)' : '▶ Tap stack trace for details'}
                    </Text>
                    {stackExpanded && (
                      <ScrollView style={styles.stackScroll} contentContainerStyle={styles.stackContent}>
                        <Text style={[styles.stackText, { color: theme.TEXT_DISABLED }]}>
                          {errorContext.stack}
                        </Text>
                      </ScrollView>
                    )}
                  </TouchableOpacity>
                  )
                : null}
            </ScrollView>

            {/* Dismiss Button */}
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={dismiss}
                activeOpacity={0.8}
                style={[styles.dismissButton, { backgroundColor: theme.CARD_BACKGROUND }]}
              >
                <Text style={[styles.dismissText, { color: theme.TEXT_PRIMARY }]}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  )
}

const createStyles = (theme) =>
  StyleSheet.create({
    root: {
      flex: 1
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)'
    },
    backdropInner: {
      flex: 1
    },
    sheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.BACKGROUND,
      borderTopLeftRadius: MODAL_CORNER_RADIUS,
      borderTopRightRadius: MODAL_CORNER_RADIUS,
      maxHeight: SCREEN_HEIGHT * 0.75,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8
        }
      })
    },
    barContainer: {
      alignItems: 'center',
      paddingVertical: 12
    },
    bar: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.TEXT_DISABLED
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 8,
      gap: 12
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '700'
    },
    closeButton: {
      padding: 4
    },
    content: {
      flex: 1
    },
    contentContainer: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 16
    },
    message: {
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 20
    },
    stackContainer: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.BORDER_LIGHT,
      overflow: 'hidden'
    },
    stackHint: {
      fontSize: 13,
      fontWeight: '500',
      padding: 12,
      textAlign: 'center'
    },
    stackScroll: {
      maxHeight: 200
    },
    stackContent: {
      padding: 16
    },
    stackText: {
      fontSize: 12,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      lineHeight: 18
    },
    footer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      paddingBottom: Platform.OS === 'ios' ? 34 : 16
    },
    dismissButton: {
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.BORDER_LIGHT
    },
    dismissText: {
      fontSize: 17,
      fontWeight: '600'
    }
  })
