import React, { useCallback, useEffect, useRef, useState } from 'react'

import MaterialIcons from '@react-native-vector-icons/material-icons'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
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
import UploadQueueModal from '../UploadQueueModal'
import LinearProgress from '../ui/LinearProgress'

const GlobalUploadBanner = () => {
  const {
    pendingPhotos,
    isUploading,
    isPaused,
    activeUploadId,
    clearPendingQueue,
    pauseUploads,
    resumeUploads,
    removePendingItem
  } = React.useContext(UploadContext)
  const netAvailable = useAtomValue(STATE.netAvailable)
  const [isDark] = useAtom(STATE.isDarkMode)
  const setBannerHeight = useSetAtom(STATE.bannerHeightAtom)
  const insets = useSafeAreaInsets()
  const theme = getTheme(isDark)
  const [bannerHeightInternal, setBannerHeightInternal] = useState(0)
  const [queueModalVisible, setQueueModalVisible] = useState(false)

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

  // Unrecoverable items (missing file / invalid location) are already part of
  // the pendingPhotos counts above — they are not double counted here. The
  // suffix only adds visibility; the user clears them via long-press.
  const unrecoverableCount = pendingPhotos.filter(item => item.unrecoverable).length
  const unrecoverableSuffix = unrecoverableCount > 0
    ? ` · ${unrecoverableCount} cannot be uploaded`
    : ''

  // Upload status label. A user-initiated pause takes precedence over the
  // network/upload-derived labels.
  let uploadStatusLabel = 'waiting to upload'
  if (netAvailable) {
    uploadStatusLabel = isPaused ? 'paused' : (isUploading ? 'uploading' : 'ready to upload')
  }

  // Dynamic icon selection. Paused state swaps in a static pause icon.
  let uploadIconName = 'cloud-upload'
  if (isPaused) {
    uploadIconName = 'pause-circle'
  } else if (imageCount === 0 && videoCount > 0) {
    uploadIconName = 'videocam'
  } else if (imageCount > 0 && videoCount === 0) {
    uploadIconName = 'photo'
  }

  // Both entry points (3-dots tap and long-press) share one handler: pause
  // the queue immediately, then open the queue management modal.
  const handleManageQueue = useCallback(() => {
    pauseUploads()
    setQueueModalVisible(true)
  }, [pauseUploads])

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
    // The pulse is the "working" affordance; it stops while the queue is
    // paused (the pause icon is static) or offline.
    if (pendingPhotos.length > 0 && netAvailable && !isPaused) {
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
  }, [pendingPhotos.length, netAvailable, isPaused, uploadIconAnimation])

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

  const toastTopOffset = insets.top + bannerHeightInternal + 10

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onLongPress={handleManageQueue}
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          top: insets.top,
          zIndex: 999,
          alignItems: 'center'
        }
      ]}
      pointerEvents='box-none'
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
            {itemCountLabel} {uploadStatusLabel}{unrecoverableSuffix}
          </Animated.Text>
        </View>
        <TouchableOpacity
          onPress={handleManageQueue}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ marginLeft: 8, padding: 4 }}
        >
          <MaterialIcons name='more-vert' size={22} color={theme.TEXT_PRIMARY} />
        </TouchableOpacity>
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
              overflow: 'hidden',
              // The strip is the "working" indicator; dim it while paused.
              opacity: isPaused ? 0.3 : 1
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
      <UploadQueueModal
        visible={queueModalVisible}
        pendingPhotos={pendingPhotos}
        activeUploadId={activeUploadId}
        clearPendingQueue={clearPendingQueue}
        removePendingItem={removePendingItem}
        resumeUploads={resumeUploads}
        toastTopOffset={toastTopOffset}
        onClose={() => setQueueModalVisible(false)}
      />
    </TouchableOpacity>
  )
}

export default GlobalUploadBanner
