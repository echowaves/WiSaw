import * as Linking from 'expo-linking'
import base64 from 'react-native-base64'

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
 * Parse friendship data from encoded parameter
 */
const parseFriendshipData = (encodedData) => {
  if (!encodedData) {
    console.log('No data parameter found')
    return null
  }

  try {
    const decodedData = base64.decode(decodeURIComponent(encodedData))
    console.log('Decoded data:', decodedData)

    const friendshipData = JSON.parse(decodedData)
    console.log('Parsed friendship data:', friendshipData)

    if (
      friendshipData.action === 'friendshipName' &&
      friendshipData.friendshipUuid &&
      friendshipData.friendName
    ) {
      console.log('Successfully parsed friendship data')
      return {
        type: 'friendshipName',
        friendshipUuid: friendshipData.friendshipUuid,
        friendName: friendshipData.friendName,
        timestamp: friendshipData.timestamp,
      }
    } else {
      console.log('Invalid friendship data structure:', {
        hasAction: !!friendshipData.action,
        actionValue: friendshipData.action,
        hasUuid: !!friendshipData.friendshipUuid,
        hasName: !!friendshipData.friendName,
      })
    }
  } catch (error) {
    console.log('Error parsing friendship data:', error)
    console.log('Error details:', {
      name: error.name,
      message: error.message,
      encodedData,
    })
  }

  return null
}

/**
 * Parse URL to extract parameters
 */
export const parseDeepLink = (url) => {
  if (!url) return null

  try {
    // Handle custom scheme URLs differently
    if (url.startsWith('wisaw://')) {
      // Parse custom scheme manually
      const urlObj = new URL(url)
      const cleanPath = urlObj.pathname.replace(/^\/+|\/+$/g, '')
      const queryParams = Object.fromEntries(urlObj.searchParams.entries())

      console.log('Parsing custom scheme deep link:', {
        url,
        cleanPath,
        queryParams,
      })

      // Handle friendship links (simplified path)
      if (cleanPath === 'friendship' || cleanPath === 'friendships/name') {
        const encodedData = queryParams.data
        console.log('Encoded data from QR:', encodedData)
        return parseFriendshipData(encodedData)
      }

      return null
    }

    // Handle standard URLs (https://, etc.)
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

    // Pattern 3: /friendships/name (for QR code friendship name sharing)
    if (cleanPath.includes('friendships/name')) {
      const encodedData = queryParams?.data
      return parseFriendshipData(encodedData)
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
