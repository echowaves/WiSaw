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
          ModalInputTextScreen: 'input',
          PinchableView: 'pinch',
        },
      },
      SecretScreen: 'identity',
      FriendsList: 'friendslist',
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

    // eslint-disable-next-line no-console
    console.log('Parsing deep link:', { url, hostname, path, queryParams })

    // Clean the path
    const cleanPath = path ? path.replace(/^\/+|\/+$/g, '') : ''

    // eslint-disable-next-line no-console
    console.log('Clean path:', cleanPath)

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
  // eslint-disable-next-line no-console
  console.log('handleDeepLink called with:', url)

  const linkData = parseDeepLink(url)

  // eslint-disable-next-line no-console
  console.log('Parsed link data:', linkData)

  if (!linkData || !navigation) return

  try {
    // Navigate to the appropriate screen
    if (linkData.type === 'photo') {
      // eslint-disable-next-line no-console
      console.log(
        'Navigating to PhotosDetailsShared with photoId:',
        linkData.photoId,
      )
      // Navigate to Home drawer screen first, then to the stack screen
      navigation.navigate('Home', {
        screen: 'PhotosDetailsShared',
        params: { photoId: linkData.photoId },
      })
    } else if (linkData.type === 'friend') {
      // eslint-disable-next-line no-console
      console.log(
        'Navigating to ConfirmFriendship with friendshipUuid:',
        linkData.friendshipUuid,
      )
      // Navigate to Home drawer screen first, then to the stack screen
      navigation.navigate('Home', {
        screen: 'ConfirmFriendship',
        params: { friendshipUuid: linkData.friendshipUuid },
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
