import base64 from 'react-native-base64'

/**
 * Simple sharing solution for React Native
 * Since proper QR code generation is complex, we'll create shareable URLs
 */

/**
 * Generate a visual representation with the shareable URL
 * Instead of a QR code, shows the URL and a simple visual pattern
 */
export const generateQRCodeSVG = (data, size = 200) => {
  try {
    // Parse the friendship data
    const friendshipData = JSON.parse(data)

    // Ensure we have a valid friend name
    const friendName = friendshipData.friendName || 'Unknown Friend'

    // Create the shareable URL
    const shareUrl = createFriendshipNameDeepLink({
      ...friendshipData,
      friendName,
    })

    // Create a simple visual that shows this is shareable content
    let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">`

    // Background
    svg += `<rect width="${size}" height="${size}" fill="white" stroke="#ddd" stroke-width="1"/>`

    // Title
    svg += `<text x="${size / 2}" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#333">Friendship Share</text>`

    // Friend name
    svg += `<text x="${size / 2}" y="55" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666">${friendName}</text>`

    // Instructions
    svg += `<text x="${size / 2}" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#888">Tap Share to send link</text>`

    // Simple visual pattern (decorative)
    const centerX = size / 2
    const centerY = size / 2 + 20
    const patternSize = 60

    // Create a simple grid pattern
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const x = centerX - patternSize / 2 + (i * patternSize) / 8
        const y = centerY - patternSize / 2 + (j * patternSize) / 8
        const cellSize = patternSize / 8

        // Create pattern based on friend name hash - safely handle undefined
        const charIndex = i % friendName.length
        const hash = friendName.charCodeAt(charIndex) || 65 // Default to 'A' if undefined
        if ((i + j + hash) % 3 === 0) {
          svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#4A90E2" opacity="0.7"/>`
        }
      }
    }

    // Border around pattern
    svg += `<rect x="${centerX - patternSize / 2}" y="${centerY - patternSize / 2}" width="${patternSize}" height="${patternSize}" fill="none" stroke="#4A90E2" stroke-width="2"/>`

    // Footer text
    svg += `<text x="${size / 2}" y="${size - 20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#888">WiSaw Friendship</text>`

    // Store the URL in a comment for the share functionality to access
    svg += `<!-- SHARE_URL:${shareUrl} -->`

    svg += '</svg>'

    return svg
  } catch (error) {
    console.error('Share visual generation error:', error)

    // Fallback
    let fallbackSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">`
    fallbackSvg += `<rect width="${size}" height="${size}" fill="white" stroke="#ddd" stroke-width="1"/>`
    fallbackSvg += `<text x="${size / 2}" y="${size / 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#333">Share Error</text>`
    fallbackSvg += '</svg>'

    return fallbackSvg
  }
}

/**
 * Create a text-based representation for debugging
 */
export const generateQRCodeText = (data) => {
  try {
    const encodedData = base64.encode(data)
    const size = 21
    let result = ''

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const index = (row * size + col) % encodedData.length
        const char = encodedData.charCodeAt(index)
        result += char % 2 === 0 ? '██' : '  '
      }
      result += '\n'
    }

    return result
  } catch (error) {
    console.error('QR text generation error:', error)
    return null
  }
}

/**
 * Create friendship QR data
 */
export const createFriendshipQRData = ({ friendshipUuid, friendName }) => {
  const qrData = {
    action: 'friendshipName',
    friendshipUuid: friendshipUuid || '',
    friendName: friendName || 'Unknown Friend',
    timestamp: Date.now(),
  }

  return JSON.stringify(qrData)
}

/**
 * Parse friendship QR data
 */
export const parseFriendshipQRData = (qrDataString) => {
  try {
    const data = JSON.parse(qrDataString)

    if (
      data.action === 'friendshipName' &&
      data.friendshipUuid &&
      data.friendName
    ) {
      return {
        friendshipUuid: data.friendshipUuid,
        friendName: data.friendName,
        timestamp: data.timestamp,
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
export const createFriendshipNameDeepLink = ({
  friendshipUuid,
  friendName,
}) => {
  const qrData = createFriendshipQRData({
    friendshipUuid: friendshipUuid || '',
    friendName: friendName || 'Unknown Friend',
  })
  const encodedData = encodeURIComponent(base64.encode(qrData))

  // Use simple custom scheme without path to avoid Expo Router conflicts
  return `wisaw://friendship?data=${encodedData}`
}

/**
 * Create a universal link for sharing (fallback to web)
 */
export const createFriendshipNameUniversalLink = ({
  friendshipUuid,
  friendName,
}) => {
  const qrData = createFriendshipQRData({
    friendshipUuid: friendshipUuid || '',
    friendName: friendName || 'Unknown Friend',
  })
  const encodedData = encodeURIComponent(base64.encode(qrData))

  // Use universal link for sharing compatibility
  return `https://link.wisaw.com/friendships/name?data=${encodedData}`
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
