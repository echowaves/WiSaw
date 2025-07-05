import { Share } from 'react-native'
import Toast from 'react-native-toast-message'

/**
 * Simple sharing helper using React Native's built-in Share API for text content and links
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
    const url = `https://link.wisaw.com/photos/${photo.id}`
    let message = `Check out what I saw today${photo?.video ? ' (video)' : ''}\n`

    if (photoDetails?.comments && photoDetails.comments.length > 0) {
      const comments = photoDetails.comments
        .slice(0, 3)
        .map((comment) => comment.comment)
        .join('\n\n')
      message += `\n\n${comments}`
    }

    return {
      message: `${message}\n\n${url}`,
    }
  }

  if (type === 'friend' && friendshipUuid) {
    const url = `https://link.wisaw.com/friends/${friendshipUuid}`
    const message = `${contactName || 'You'}, you've got a WiSaw friendship request. Make sure you have Wisaw App installed from the app store.`

    return {
      message: `${message}\n\n${url}`,
    }
  }

  return null
}

/**
 * Simple sharing function using React Native's built-in Share API
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

    // Use React Native's built-in Share API for sharing text and links
    const shareOptions = {
      message: content.message,
    }

    const result = await Share.share(shareOptions)

    // Show success toast
    Toast.show({
      text1: 'Shared successfully!',
      text2:
        result.action === Share.sharedAction
          ? 'Content shared'
          : 'Share dismissed',
      type: 'success',
      topOffset,
    })

    return { success: true, action: result.action }
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
