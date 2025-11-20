import React from 'react'
import {
  View,
  TouchableOpacity,
  Animated,
  Alert
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import Toast from 'react-native-toast-message'

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

  let uploadStatusLabel = 'waiting to upload'
  if (netAvailable) {
    uploadStatusLabel = isUploading ? 'uploading' : 'ready to upload'
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        Alert.alert(
          'Clear Upload Queue',
          `Are you sure you want to cancel all ${pendingPhotos.length} pending upload${pendingPhotos.length === 1 ? '' : 's'}? This cannot be undone.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Clear All',
              style: 'destructive',
              onPress: async () => {
                await clearPendingQueue()
                Toast.show({
                  text1: 'Upload queue cleared',
                  text2: 'All pending uploads have been cancelled',
                  type: 'success',
                  topOffset: toastTopOffset
                })
              }
            }
          ]
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
          <MaterialIcons
            name='cloud-upload'
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
            {pendingPhotos.length} {pendingPhotos.length === 1 ? 'photo' : 'photos'}{' '}
            {uploadStatusLabel}
          </Animated.Text>
        </View>
        {netAvailable && (
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 4,
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
              backgroundColor: theme.INTERACTIVE_PRIMARY,
              width: '100%' // Simplified progress bar for now
            }}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  )
}

export default PendingPhotosBanner
