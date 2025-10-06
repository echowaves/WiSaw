import base64 from 'react-native-base64'

/**
 * Simple sharing solution for React Native
 * Creates shareable URLs for friendship invitations
 */

/**
 * Create friendship QR data
 */
export const createFriendshipQRData = ({ friendshipUuid, friendName }) => {
  const qrData = {
    action: 'friendshipName',
    friendshipUuid: friendshipUuid || '',
    friendName: friendName || 'Unknown Friend',
    timestamp: Date.now()
  }

  return JSON.stringify(qrData)
}

/**
 * Parse friendship QR data
 */
export const parseFriendshipQRData = (qrDataString) => {
  try {
    const data = JSON.parse(qrDataString)

    if (data.action === 'friendshipName' && data.friendshipUuid && data.friendName) {
      return {
        friendshipUuid: data.friendshipUuid,
        friendName: data.friendName,
        timestamp: data.timestamp
      }
    }

    return null
  } catch (error) {
    console.error('QR data parsing error:', error)
    return null
  }
}

/**
 * Create a deep link URL for friendship name sharing
 */
export const createFriendshipNameDeepLink = ({ friendshipUuid, friendName }) => {
  const qrData = createFriendshipQRData({
    friendshipUuid: friendshipUuid || '',
    friendName: friendName || 'Unknown Friend'
  })
  const encodedData = encodeURIComponent(base64.encode(qrData))

  // Use simple custom scheme with query parameter only to avoid Expo Router conflicts
  return `wisaw://?type=friendship&data=${encodedData}`
}

/**
 * Create a universal link for sharing (using custom scheme for consistency)
 */
export const createFriendshipNameUniversalLink = ({ friendshipUuid, friendName }) => {
  const qrData = createFriendshipQRData({
    friendshipUuid: friendshipUuid || '',
    friendName: friendName || 'Unknown Friend'
  })
  const encodedData = encodeURIComponent(base64.encode(qrData))

  // Use custom scheme for sharing to ensure it opens in app consistently
  // This matches the same URL format used for QR codes to maintain consistency
  return `wisaw://?type=friendship&data=${encodedData}`
}

/**
 * Parse deep link for friendship name data
 */
export const parseDeepLinkForFriendshipName = (url) => {
  try {
    const urlObj = new URL(url)

    if (urlObj.pathname.includes('/friendships/name')) {
      const encodedData = urlObj.searchParams.get('data')
      if (encodedData) {
        const decodedData = base64.decode(decodeURIComponent(encodedData))
        return parseFriendshipQRData(decodedData)
      }
    }

    return null
  } catch (error) {
    console.error('Deep link parsing error:', error)
    return null
  }
}
