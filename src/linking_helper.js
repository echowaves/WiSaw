import * as Linking from 'expo-linking'
import { Alert, Platform, Share } from 'react-native'

const handleDeepLink = async ({ url, navigation }) => {
  if (!url) return

  try {
    // Parse the URL
    const { hostname, path, queryParams } = Linking.parse(url)

    // Handle photo links: https://wisaw.com/photos/12345 or https://link.wisaw.com/photos/12345
    if (path && (path.includes('/photos/') || path.includes('photos/'))) {
      // Handle both "/photos/" and "photos/" patterns
      const photoId = path.includes('/photos/')
        ? path.split('/photos/')[1]?.split('?')[0]?.split('#')[0]
        : path.split('photos/')[1]?.split('?')[0]?.split('#')[0]

      if (photoId) {
        await navigation.popToTop()
        navigation.navigate('PhotosDetailsShared', { photoId })
        return
      }
    }

    // Handle friendship links: https://wisaw.com/friends/uuid or https://link.wisaw.com/friends/uuid
    if (path && path.includes('/friends/')) {
      const friendshipUuid = path
        .split('/friends/')[1]
        ?.split('?')[0]
        ?.split('#')[0] // Remove query params and fragments
      if (friendshipUuid) {
        await navigation.popToTop()
        navigation.navigate('ConfirmFriendship', { friendshipUuid })
        return
      }
    }

    // Handle query parameters for backward compatibility
    if (queryParams?.photoId) {
      await navigation.popToTop()
      await navigation.navigate('PhotosDetailsShared', {
        photoId: queryParams.photoId,
      })
      return
    }

    if (queryParams?.friendshipUuid) {
      await navigation.popToTop()
      await navigation.navigate('ConfirmFriendship', {
        friendshipUuid: queryParams.friendshipUuid,
      })
    }

    // Unhandled deep link
  } catch (error) {
    // Error handling deep link - silently fail
  }
}

export const initLinking = ({ navigation }) => {
  // Handle app opened from link when app is closed
  Linking.getInitialURL().then((url) => {
    if (url) {
      handleDeepLink({ url, navigation })
    }
  })

  // Handle app opened from link when app is in background
  const subscription = Linking.addEventListener('url', ({ url }) => {
    handleDeepLink({ url, navigation })
  })

  return () => subscription?.remove()
}

export const sharePhoto = async ({ photo, photoDetails }) => {
  try {
    const url = `https://link.wisaw.com/photos/${photo?.id}`

    let messageBody = `Check out what I saw today${
      photo?.video ? ' (video)' : ''
    }: ${url}`

    if (photoDetails?.comments && photoDetails.comments.length > 0) {
      // Add first 3 comments
      messageBody = `${messageBody}\n\n${photoDetails.comments
        .slice(0, 3)
        .map((comment) => comment.comment)
        .join('\n\n')}`
    }

    // Try React Native's Share API first
    const result = await Share.share(
      {
        title: 'WiSaw - What I Saw Today',
        message:
          Platform.OS === 'ios'
            ? messageBody
            : `WiSaw - What I Saw Today\n\n${messageBody}`,
        url: Platform.OS === 'ios' ? url : undefined,
      },
      {
        subject: 'WiSaw: Check out what I saw today',
        dialogTitle: 'Share via',
      },
    )

    return { success: result.action === Share.sharedAction }
  } catch (error) {
    // Fallback to email if Share API fails
    try {
      const url = `https://link.wisaw.com/photos/${photo?.id}`
      let messageBody = `Check out what I saw today${
        photo?.video ? ' (video)' : ''
      }: ${url}`

      if (photoDetails?.comments && photoDetails.comments.length > 0) {
        messageBody = `${messageBody}\n\n${photoDetails.comments
          .slice(0, 3)
          .map((comment) => comment.comment)
          .join('\n\n')}`
      }

      await Linking.openURL(
        `mailto:?subject=WiSaw: Check out what I saw today&body=${encodeURIComponent(messageBody)}`,
      )
      return { success: true, method: 'email_fallback' }
    } catch (emailError) {
      Alert.alert('Error', 'Unable to share photo')
      return { success: false, error: emailError }
    }
  }
}
