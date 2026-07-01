import React from 'react'
import {
  View,
  TouchableOpacity,
  Animated,
  Alert
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import showToast from '../../../utils/showToast'
import showConfirmAlert from '../../../utils/showConfirmAlert'

import LinearProgress from '../../../components/ui/LinearProgress'
import * as CONST from '../../../consts'

const PendingPhotosBanner = ({
  theme,
  pendingPhotos,
  netAvailable,
  isUploading,
  clearPendingQueue,
  toastTopOffset,
  pendingPhotosAnimation,
  uploadIconAnimation
}) => {
  if (pendingPhotos.length === 0) return null

  // Tasks 1.1-1.3: Count image and video items separately
  const imageCount = pendingPhotos.filter(item => item.type === 'image').length
  const videoCount = pendingPhotos.filter(item => item.type === 'video').length

  // Task 1.2: formatItemCount helper for singular/plural formatting
  const formatItemCount = (count, singular, plural) => {
    if (count === 0) return null
    return `${count} ${count === 1 ? singular : plural}`
  }

  // Task 1.3: Build itemCountLabel combining photo and video counts
  const itemCounts = [
    formatItemCount(imageCount, 'photo', 'photos'),
    formatItemCount(videoCount, 'video', 'videos')
  ].filter(Boolean)

  const itemCountLabel = itemCounts.length > 0
    ? itemCounts.join(', ')
    : `${pendingPhotos.length} item${pendingPhotos.length === 1 ? '' : 's'}`

  let uploadStatusLabel = 'waiting to upload'
  if (netAvailable) {
    uploadStatusLabel = isUploading ? 'uploading' : 'ready to upload'
  }

  // Task 1.5: Dynamic icon selection
  let uploadIconName = 'cloud-upload' // default for mixed
  if (imageCount === 0 && videoCount > 0) {
    uploadIconName = 'videocam'
  } else if (imageCount > 0 && videoCount === 0) {
    uploadIconName = 'photo'
  }

  // Task 1.6: Build breakdown string for confirm alert
  const clearBreakdown = [
    formatItemCount(imageCount, 'photo', 'photos'),
    formatItemCount(videoCount, 'video', 'videos')
  ].filter(Boolean).join(' and ') || `${pendingPhotos.length} item${pendingPhotos.length === 1 ? '' : 's'}`

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        showConfirmAlert(
          'Clear Upload Queue',
          `Are you sure you want to cancel all ${clearBreakdown}? This cannot be undone.${clearBreakdown !== pendingPhotos.length.toString() ? '' : ''}`,
          async () => {
            await clearPendingQueue()
            showToast('Upload queue cleared', { text2: 'All pending uploads have been cancelled', type: 'success', topOffset: toastTopOffset })
          },
          { destructiveText: 'Clear All' }
        )
      }}
    >
      <Animated.View
        style={{
          backgroundColor: theme.CARD_BACKGROUND,
          borderRadius: 12,
          padding: 16,
          marginHorizontal: 16,
          marginVertical: 8,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.CARD_BORDER,
          shadowColor: theme.CARD_SHADOW,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 3,
          position: 'relative',
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
            transform: [
              {
                scale: uploadIconAnimation
              }
            ]
          }}
        >
          {/* Task 1.5: Use dynamic icon */}
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
            {/* Task 1.4: Use itemCountLabel instead of generic count */}
            {itemCountLabel}{' '}
            {uploadStatusLabel}
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

export default PendingPhotosBanner
