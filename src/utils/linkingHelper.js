import * as Linking from 'expo-linking'

// =============================================================================
// EXPO ROUTER LINKING CONFIGURATION
// =============================================================================

// URL prefix for the app's deep links - Expo Router handles these automatically
const URL_PREFIX = Linking.createURL('/')

// Expo Router will automatically handle routing based on file structure
// This configuration is mainly for reference and legacy support
export const linkingConfig = {
  prefixes: [URL_PREFIX, 'https://link.wisaw.com', 'https://wisaw.com'],
  config: {
    screens: {
      '(drawer)': {
        screens: {
          '(tabs)': {
            screens: {
              index: '',
              'photos/[id]': 'photos/:id',
              'shared/[photoId]': 'photos/:photoId',
              'confirm-friendship/[friendshipUuid]': 'friends/:friendshipUuid',
              chat: 'chat',
              'modal-input': 'input',
              pinch: 'pinch',
            },
          },
          identity: 'identity',
          friends: 'friendslist',
          feedback: 'feedback',
        },
      },
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

    // Handle different URL patterns

    // Pattern 1: /photos/[id] or /shared/[id]
    if (cleanPath.includes('photos/') || cleanPath.includes('shared/')) {
      const photoId = cleanPath
        .split(/(?:photos|shared)\//)[1]
        ?.split('?')[0]
        ?.split('#')[0]
      if (photoId) {
        return {
          type: 'photo',
          photoId: photoId.trim(),
        }
      }
    }

    // Pattern 2: /friends/[uuid] or /confirm-friendship/[uuid]
    if (
      cleanPath.includes('friends/') ||
      cleanPath.includes('confirm-friendship/')
    ) {
      const friendshipUuid = cleanPath
        .split(/(?:friends|confirm-friendship)\//)[1]
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
