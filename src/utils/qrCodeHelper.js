import base64 from 'react-native-base64'

/**
 * Simple sharing solution for React Native
 * Since proper QR code generation is complex, we'll create shareable URLs
 */

/**
 * Sanitize a numeric value to prevent XSS
 */
const sanitizeNumeric = (value) => {
  const num = Number(value)
  return Number.isFinite(num) && num > 0 ? num : 200
}

/**
 * Sanitize text for safe inclusion in SVG
 */
const sanitizeText = (text) => {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Generate a visual representation with the shareable URL
 * Instead of a QR code, shows the URL and a simple visual pattern
 */
export const generateQRCodeSVG = (data, size = 200) => {
  try {
    // Sanitize size parameter
    const safeSize = sanitizeNumeric(size)
    
    // Parse the friendship data
    const friendshipData = JSON.parse(data)

    // Ensure we have a valid friend name
    const friendName = friendshipData.friendName || 'Unknown Friend'
    const safeFriendName = sanitizeText(friendName)

    // Create the shareable URL
    const shareUrl = createFriendshipNameDeepLink({
      ...friendshipData,
      friendName
    })

    // Create a simple visual that shows this is shareable content
    let svg = `<svg width="${safeSize}" height="${safeSize}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${safeSize} ${safeSize}">`

    // Background
    svg += `<rect width="${safeSize}" height="${safeSize}" fill="white" stroke="#ddd" stroke-width="1"/>`

    // Title
    svg += `<text x="${safeSize / 2}" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#333">Friendship Share</text>`

    // Friend name (sanitized for display)
    svg += `<text x="${safeSize / 2}" y="55" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666">${safeFriendName}</text>`

    // Instructions
    svg += `<text x="${safeSize / 2}" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#888">Tap Share to send link</text>`

    // Simple visual pattern (decorative)
    const centerX = safeSize / 2
    const centerY = safeSize / 2 + 20
    const patternSize = 60

    // Create a simple grid pattern
    // Use the unsanitized friendName from friendshipData for pattern generation (not displayed)
    const rawFriendName = friendshipData.friendName || 'Unknown Friend'
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const x = centerX - patternSize / 2 + (i * patternSize) / 8
        const y = centerY - patternSize / 2 + (j * patternSize) / 8
        const cellSize = patternSize / 8

        // Create pattern based on friend name hash - safely handle undefined
        const charIndex = i % rawFriendName.length
        const hash = rawFriendName.charCodeAt(charIndex) || 65 // Default to 'A' if undefined
        if ((i + j + hash) % 3 === 0) {
          svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#4A90E2" opacity="0.7"/>`
        }
      }
    }

    // Border around pattern
    svg += `<rect x="${centerX - patternSize / 2}" y="${centerY - patternSize / 2}" width="${patternSize}" height="${patternSize}" fill="none" stroke="#4A90E2" stroke-width="2"/>`

    // Footer text
    svg += `<text x="${safeSize / 2}" y="${safeSize - 20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#888">WiSaw Friendship</text>`

    // Store the URL in a comment for the share functionality to access (sanitize URL)
    const safeShareUrl = sanitizeText(shareUrl)
    svg += `<!-- SHARE_URL:${safeShareUrl} -->`

    // Close SVG
    svg += '</svg>'

    return svg
  } catch (error) {
    console.error('Share visual generation error:', error)

    // Fallback with sanitized size
    const safeSize = sanitizeNumeric(size)
    let fallbackSvg = `<svg width="${safeSize}" height="${safeSize}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${safeSize} ${safeSize}">`
    fallbackSvg += `<rect width="${safeSize}" height="${safeSize}" fill="white" stroke="#ddd" stroke-width="1"/>`
    fallbackSvg += `<text x="${safeSize / 2}" y="${safeSize / 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#333">Share Error</text>`
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
