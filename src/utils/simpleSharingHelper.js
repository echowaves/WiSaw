import * as Sharing from 'expo-sharing'
import { Platform } from 'react-native'
import Toast from 'react-native-toast-message'

/**
 * Simple sharing helper using expo-sharing for a cleaner, more maintainable approach
 */

/**
 * Create sharing content for different contexts
 */
export const createShareContent = ({
  type,
  photo,
  photoDetails,
  friendshipUuid,
  contactName,
}) => {
  if (type === 'photo' && photo) {
    let message = `Check out what I saw today${photo?.video ? ' (video)' : ''}`
    const url = `https://link.wisaw.com/photos/${photo.id}`

    if (photoDetails?.comments && photoDetails.comments.length > 0) {
      message += `\n\n${photoDetails.comments
        .slice(0, 3)
        .map((comment) => comment.comment)
        .join('\n\n')}`
    }

    return {
      title: 'WiSaw - What I Saw Today',
      message: `${message}\n\n${url}`,
      url,
    }
  }

  if (type === 'friend' && friendshipUuid) {
    const url = `https://link.wisaw.com/friends/${friendshipUuid}`
    const message = `${contactName || 'You'}, you've got a WiSaw friendship request. Make sure you have Wisaw App installed from the app store. To confirm, follow the url: ${url}`

    return {
      title: 'WiSaw Friendship Request',
      message,
      url,
    }
  }

  return null
}

/**
 * Check if sharing is available on the device
 */
export const isAvailableAsync = async () => {
  try {
    return await Sharing.isAvailableAsync()
  } catch (error) {
    console.error('Error checking sharing availability:', error)
    return false
  }
}

/**
 * Simple sharing function using expo-sharing
 */
export const shareContent = async ({
  type,
  photo,
  photoDetails,
  friendshipUuid,
  contactName,
  topOffset = 100,
}) => {
  try {
    // Check if sharing is available
    const available = await isAvailableAsync()
    if (!available) {
      throw new Error('Sharing is not available on this device')
    }

    // Create sharing content
    const content = createShareContent({
      type,
      photo,
      photoDetails,
      friendshipUuid,
      contactName,
    })

    if (!content) {
      throw new Error('Unable to create sharing content')
    }

    // Use expo-sharing to share the content
    const shareOptions = {
      mimeType: 'text/plain',
      dialogTitle: content.title,
    }

    if (Platform.OS === 'android') {
      shareOptions.UTI = 'public.text'
    }

    await Sharing.shareAsync(content.message, shareOptions)

    // Show success toast
    Toast.show({
      text1: 'Shared successfully!',
      text2: 'Content shared via system share sheet',
      type: 'success',
      topOffset,
    })

    return { success: true }
  } catch (error) {
    console.error('Sharing error:', error)

    // Show error toast
    Toast.show({
      text1: 'Sharing failed',
      text2: error.message || 'Unable to share content',
      type: 'error',
      topOffset,
    })

    return { success: false, error: error.message }
  }
}

/**
 * Share a photo with simplified interface
 */
export const sharePhoto = async (photo, photoDetails, topOffset = 100) => {
  return shareContent({
    type: 'photo',
    photo,
    photoDetails,
    topOffset,
  })
}

/**
 * Share a friendship request with simplified interface
 */
export const shareFriendship = async (
  friendshipUuid,
  contactName,
  topOffset = 100,
) => {
  return shareContent({
    type: 'friend',
    friendshipUuid,
    contactName,
    topOffset,
  })
}

/**
 * Generic share function with native sheet (legacy compatibility)
 */
export const shareWithNativeSheet = async ({
  type,
  photo,
  photoDetails,
  friendshipUuid,
  contactName,
  topOffset = 100,
}) => {
  return shareContent({
    type,
    photo,
    photoDetails,
    friendshipUuid,
    contactName,
    topOffset,
  })
}
