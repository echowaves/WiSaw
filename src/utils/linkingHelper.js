/* eslint-disable no-console */
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
              pinch: 'pinch'
            }
          },
          identity: 'identity',
          friends: 'friendslist',
          feedback: 'feedback'
        }
      }
    }
  }
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
        timestamp: friendshipData.timestamp
      }
    }

    console.log('Invalid friendship data structure:', {
      hasAction: !!friendshipData.action,
      actionValue: friendshipData.action,
      hasUuid: !!friendshipData.friendshipUuid,
      hasName: !!friendshipData.friendName
    })
  } catch (error) {
    console.log('Error parsing friendship data:', error)
    console.log('Error details:', {
      name: error.name,
      message: error.message,
      encodedData
    })
  }

  return null
}

const trimSlashes = (value = '') => value.replace(/^\/+|\/+$/g, '')

const resolveDeepLinkTarget = (rawPath, queryParams) => {
  const sanitizedPath = rawPath
    ? rawPath
      .replace(/[#?].*$/, '')
      .split('/')
      .filter(Boolean)
    : []

  if (sanitizedPath.length) {
    const [primarySegment, secondarySegment] = sanitizedPath
    const isPhotoRoute = primarySegment === 'photos' || primarySegment === 'shared'
    const isFriendRoute = primarySegment === 'friends' || primarySegment === 'confirm-friendship'

    if (isPhotoRoute && secondarySegment) {
      return {
        type: 'photo',
        photoId: secondarySegment.trim()
      }
    }

    if (isFriendRoute && secondarySegment) {
      return {
        type: 'friend',
        friendshipUuid: secondarySegment.trim()
      }
    }

    if (
      primarySegment === 'friendship' ||
      (primarySegment === 'friendships' && sanitizedPath[1] === 'name')
    ) {
      const encodedData = queryParams?.data
      if (encodedData) {
        return parseFriendshipData(encodedData)
      }
    }
  }

  if (queryParams?.photoId) {
    return {
      type: 'photo',
      photoId: queryParams.photoId
    }
  }

  if (queryParams?.friendshipUuid) {
    return {
      type: 'friend',
      friendshipUuid: queryParams.friendshipUuid
    }
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
      const host = urlObj.host?.toLowerCase?.() ?? ''
      const normalizedPath = trimSlashes(urlObj.pathname)
      const pathSegments = []

      if (host) {
        pathSegments.push(
          ...host
            .split('/')
            .map((segment) => segment.trim())
            .filter(Boolean)
        )
      }

      if (normalizedPath) {
        pathSegments.push(
          ...normalizedPath
            .split('/')
            .map((segment) => segment.trim())
            .filter(Boolean)
        )
      }

      const combinedPath = pathSegments.join('/')
      const params = Object.fromEntries(urlObj.searchParams.entries())

      console.log('Parsing custom scheme deep link:', {
        url,
        host,
        pathname: normalizedPath,
        combinedPath,
        queryParams: params
      })

      // Handle friendship links - new format with type parameter
      if (params.type === 'friendship' && params.data) {
        const encodedData = params.data
        console.log('Encoded data from QR:', encodedData)
        return parseFriendshipData(encodedData)
      }

      const resolvedTarget = resolveDeepLinkTarget(combinedPath, params)
      if (resolvedTarget) {
        return resolvedTarget
      }

      return null
    }

    // Handle standard URLs (https://, etc.)
    const { hostname, path, queryParams } = Linking.parse(url)

    console.log('Parsing deep link:', { url, hostname, path, queryParams })

    // Clean the path
    const cleanPath = trimSlashes(path)

    console.log('Clean path:', cleanPath)

    return resolveDeepLinkTarget(cleanPath, queryParams)
  } catch (error) {
    console.log('Deep link parsing error:', error)
    return null
  }
}

/**
 * Handle deep link navigation
 */
export const handleDeepLink = (url, navigation) => {
  console.log('handleDeepLink called with:', url)

  const linkData = parseDeepLink(url)

  console.log('Parsed link data:', linkData)

  if (!linkData || !navigation) return

  try {
    // Navigate to the appropriate screen
    if (linkData.type === 'photo') {
      console.log('Navigating to PhotosDetailsShared with photoId:', linkData.photoId)
      // Navigate to Home drawer screen first, then to the stack screen
      navigation.navigate('Home', {
        screen: 'PhotosDetailsShared',
        params: { photoId: linkData.photoId }
      })
    } else if (linkData.type === 'friend') {
      console.log('Navigating to ConfirmFriendship with friendshipUuid:', linkData.friendshipUuid)
      // Navigate to Home drawer screen first, then to the stack screen
      navigation.navigate('Home', {
        screen: 'ConfirmFriendship',
        params: { friendshipUuid: linkData.friendshipUuid }
      })
    }
  } catch (error) {
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
