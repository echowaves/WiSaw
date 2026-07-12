import React, { useCallback, useEffect, useRef, useState } from 'react'

import { MaterialIcons } from '@expo/vector-icons'
import { useAtom, useSetAtom } from 'jotai'
import * as Haptics from 'expo-haptics'
import {
  Animated,
  TouchableOpacity,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import UploadContext from '../../contexts/UploadContext'
import * as CONST from '../../consts'
import { getTheme } from '../../theme/sharedStyles'
import * as STATE from '../../state'
import showConfirmAlert from '../../utils/showConfirmAlert'
import showToast from '../../utils/showToast'
import LinearProgress from '../ui/LinearProgress'

const GlobalUploadBanner = () => {
  const { pendingPhotos, netAvailable, isUploading, clearPendingQueue } = React.useContext(UploadContext)
  const [isDark] = useAtom(STATE.isDarkMode)
  const setBannerHeight = useSetAtom(STATE.bannerHeightAtom)
  const insets = useSafeAreaInsets()
  const theme = getTheme(isDark)
  const [bannerHeightInternal, setBannerHeightInternal] = useState(0)

  // Animation values
  const pendingPhotosAnimation = useRef(new Animated.Value(0)).current
  const uploadIconAnimation = useRef(new Animated.Value(1)).current
  const [previousPendingCount, setPreviousPendingCount] = useState(0)

  // Count image and video items separately
  const imageCount = pendingPhotos.filter(item => item.type === 'image').length
  const videoCount = pendingPhotos.filter(item => item.type === 'video').length

  // Format item count with singular/plural
  const formatItemCount = (count, singular, plural) => {
    if (count === 0) return null
    return `${count} ${count === 1 ? singular : plural}`
  }

  // Build item count label
  const itemCounts = [
    formatItemCount(imageCount, 'photo', 'photos'),
    formatItemCount(videoCount, 'video', 'videos')
  ].filter(Boolean)

  const itemCountLabel = itemCounts.length > 0
    ? itemCounts.join(', ')
    : `${pendingPhotos.length} item${pendingPhotos.length === 1 ? '' : 's'}`

  // Upload status label
  let uploadStatusLabel = 'waiting to upload'
  if (netAvailable) {
    uploadStatusLabel = isUploading ? 'uploading' : 'ready to upload'
  }

  // Dynamic icon selection
  let uploadIconName = 'cloud-upload'
  if (imageCount === 0 && videoCount > 0) {
    uploadIconName = 'videocam'
  } else if (imageCount > 0 && videoCount === 0) {
    uploadIconName = 'photo'
  }

  // Breakdown string for clear confirmation
  const clearBreakdown = [
    formatItemCount(imageCount, 'photo', 'photos'),
    formatItemCount(videoCount, 'video', 'videos')
  ].filter(Boolean).join(' and ') || `${pendingPhotos.length} item${pendingPhotos.length === 1 ? '' : 's'}`

  // Clear queue handler with toast offset below banner
  const handleClearQueue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const toastTopOffset = insets.top + bannerHeightInternal + 10
    showConfirmAlert(
      'Clear Upload Queue',
      `Are you sure you want to cancel all ${clearBreakdown}? This cannot be undone.`,
      async () => {
        await clearPendingQueue()
        showToast('Upload queue cleared', { text2: 'All pending uploads have been cancelled', type: 'success', topOffset: toastTopOffset })
      },
      { destructiveText: 'Clear All' }
    )
  }, [clearBreakdown, clearPendingQueue, bannerHeightInternal, insets.top])

  // Animation effects
  useEffect(() => {
    if (pendingPhotos.length > 0 && previousPendingCount === 0) {
      // Animate in when photos are added
      Animated.spring(pendingPhotosAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8
      }).start()
    } else if (pendingPhotos.length === 0 && previousPendingCount > 0) {
      // Animate out when all photos are uploaded
      Animated.timing(pendingPhotosAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start()
    }

    setPreviousPendingCount(pendingPhotos.length)
  }, [pendingPhotos.length, previousPendingCount, pendingPhotosAnimation])

  useEffect(() => {
    if (pendingPhotos.length > 0 && netAvailable) {
      // Start pulsing icon animation when uploading
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(uploadIconAnimation, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.timing(uploadIconAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true
          })
        ])
      )
      pulseAnimation.start()

      return () => {
        pulseAnimation.stop()
        uploadIconAnimation.setValue(1)
      }
    }
    uploadIconAnimation.setValue(1)
  }, [pendingPhotos.length, netAvailable, uploadIconAnimation])

  // Measure height and publish to atom
  const handleLayout = useCallback((event) => {
    const height = event.nativeEvent.layout.height
    setBannerHeightInternal(height)
    setBannerHeight(height)
  }, [setBannerHeight])

  // Reset atom when banner hides
  useEffect(() => {
    if (pendingPhotos.length === 0) {
      setBannerHeight(0)
    }
  }, [pendingPhotos.length, setBannerHeight])

  if (pendingPhotos.length === 0) return null

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onLongPress={handleClearQueue}
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          top: insets.top,
          zIndex: 999,
          alignItems: 'center',
        }
      ]}
      pointerEvents="box-none"
    >
      <Animated.View
        onLayout={handleLayout}
        style={{
          backgroundColor: theme.CARD_BACKGROUND,
          borderRadius: 12,
          padding: 16,
          marginHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.CARD_BORDER,
          shadowColor: theme.CARD_SHADOW,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 3,
          opacity: pendingPhotosAnimation,
          transform: [
            {
              translateY: pendingPhotosAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0]
              })
            },
            {
              scale: pendingPhotosAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1]
              })
            }
          ]
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: uploadIconAnimation }]
          }}
        >
          <MaterialIcons
            name={uploadIconName}
            size={24}
            color={netAvailable ? theme.INTERACTIVE_PRIMARY : theme.TEXT_DISABLED}
            style={{ marginRight: 12 }}
          />
        </Animated.View>
        <View style={{ flex: 1 }}>
          <Animated.Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.TEXT_PRIMARY,
              marginBottom: 4,
              opacity: pendingPhotosAnimation
            }}
          >
            {itemCountLabel} {uploadStatusLabel}
          </Animated.Text>
        </View>
        {netAvailable && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
              overflow: 'hidden'
            }}
          >
            <LinearProgress
              color={CONST.MAIN_COLOR}
              style={{
                flex: 1,
                height: 3
              }}
            />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  )
}

export default GlobalUploadBanner
