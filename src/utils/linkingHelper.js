import * as Linking from 'expo-linking'

// =============================================================================
// LINKING CONFIGURATION
// =============================================================================

// URL prefix for the app's deep links
const URL_PREFIX = Linking.createURL('/')

// Define the linking configuration for navigation
export const linkingConfig = {
  prefixes: [URL_PREFIX, 'https://link.wisaw.com', 'https://wisaw.com'],
  config: {
    screens: {
      Home: {
        screens: {
          PhotosList: '',
          PhotosDetails: 'photos/:id',
          PhotosDetailsShared: 'photos/:photoId',
          ConfirmFriendship: 'friends/:friendshipUuid',
          Chat: 'chat',
          FriendsList: 'friends',
          ModalInputTextScreen: 'input',
          PinchableView: 'pinch',
        },
      },
      SecretScreen: 'identity',
      FriendsList: 'friends',
      Feedback: 'feedback',
    },
  },
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Parse URL to extract parameters
 */
export const parseDeepLink = (url) => {
  if (!url) return null

  try {
    const { hostname, path, queryParams } = Linking.parse(url)
    
    // Clean the path
    const cleanPath = path ? path.replace(/^\/+|\/+$/g, '') : ''

    // Parse photo links
    if (cleanPath.includes('photos/')) {
      const photoId = cleanPath
        .split('photos/')[1]
        ?.split('?')[0]
        ?.split('#')[0]
      if (photoId) {
        return {
          type: 'photo',
          photoId: photoId.trim(),
        }
      }
    }

    // Parse friend links
    if (cleanPath.includes('friends/')) {
      const friendshipUuid = cleanPath
        .split('friends/')[1]
        ?.split('?')[0]
        ?.split('#')[0]
      if (friendshipUuid) {
        return {
          type: 'friend',
          friendshipUuid: friendshipUuid.trim(),
        }
      }
    }

    // Handle legacy query parameters
    if (queryParams?.photoId) {
      return {
        type: 'photo',
        photoId: queryParams.photoId,
      }
    }

    if (queryParams?.friendshipUuid) {
      return {
        type: 'friend',
        friendshipUuid: queryParams.friendshipUuid,
      }
    }

    return null
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Deep link parsing error:', error)
    return null
  }
}

/**
 * Handle deep link navigation
 */
export const handleDeepLink = (url, navigation) => {
  const linkData = parseDeepLink(url)
  
  if (!linkData || !navigation) return

  try {
    // Navigate to top of stack first
    navigation.popToTop()

    // Navigate to the appropriate screen
    if (linkData.type === 'photo') {
      navigation.navigate('PhotosDetailsShared', {
        photoId: linkData.photoId,
      })
    } else if (linkData.type === 'friend') {
      navigation.navigate('ConfirmFriendship', {
        friendshipUuid: linkData.friendshipUuid,
      })
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Navigation error:', error)
  }
}

/**
 * Get the initial URL when app is opened from a link
 */
export const getInitialURL = async () => {
  try {
    return await Linking.getInitialURL()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Error getting initial URL:', error)
    return null
  }
}

/**
 * Add event listener for URL changes
 */
export const addLinkingListener = (callback) => {
  const subscription = Linking.addEventListener('url', callback)
  return () => subscription?.remove()
}

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize linking with navigation
 * This should be called once when the app starts
 */
export const initLinking = async (navigation) => {
  if (!navigation) return

  // Handle initial URL if app was opened from a link
  const initialUrl = await getInitialURL()
  if (initialUrl) {
    handleDeepLink(initialUrl, navigation)
  }

  // Set up listener for incoming links when app is already open
  addLinkingListener(({ url }) => {
    handleDeepLink(url, navigation)
  })
}
