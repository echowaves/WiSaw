import * as SMS from 'expo-sms'
import { Alert, Linking, Platform, Share } from 'react-native'

// =============================================================================
// CONSTANTS
// =============================================================================

// Social media and messaging app deep link schemes
const APP_SCHEMES = {
  // Social Media
  facebook: 'fb://share',
  twitter: 'twitter://post',
  instagram: 'instagram://camera',
  tiktok: 'tiktok://share',
  snapchat: 'snapchat://',
  linkedin: 'linkedin://share',
  pinterest: 'pinterest://create',

  // Messaging - using app schemes for detection
  whatsapp: 'whatsapp://send',
  telegram: 'tg://msg',
  imessage: 'sms:',
  slack: 'slack://open',
  discord: 'discord://',

  // Email
  gmail: 'googlegmail://co',
  outlook: 'ms-outlook://compose',

  // Other
  reddit: 'reddit://submit',
  youtube: 'youtube://upload',
}

// App name mapping for display
const APP_NAME_MAP = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  facebook: 'Facebook',
  twitter: 'Twitter',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  snapchat: 'Snapchat',
  linkedin: 'LinkedIn',
  pinterest: 'Pinterest',
  imessage: 'Messages',
  gmail: 'Gmail',
  outlook: 'Outlook',
  reddit: 'Reddit',
  youtube: 'YouTube',
  slack: 'Slack',
  discord: 'Discord',
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format app name for display
 */
const formatAppName = (appName) =>
  APP_NAME_MAP[appName] || appName.charAt(0).toUpperCase() + appName.slice(1)

/**
 * Check if an app is installed
 */
const isAppInstalled = async (scheme) => {
  try {
    return await Linking.canOpenURL(scheme)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Error checking app availability:', error)
    return false
  }
}

/**
 * Check if a URL has proper Open Graph meta tags for WhatsApp previews
 */
export const checkUrlForPreview = async (url) => {
  try {
    console.log('Checking URL for Open Graph tags:', url)

    // Simple test - try to fetch the URL to see if it's accessible
    const response = await fetch(url, {
      method: 'HEAD',
      timeout: 5000,
    })

    if (response.ok) {
      console.log('URL is accessible, status:', response.status)
      return { accessible: true, status: response.status }
    } else {
      console.log('URL returned non-OK status:', response.status)
      return { accessible: false, status: response.status }
    }
  } catch (error) {
    console.log('URL check failed:', error.message)
    return { accessible: false, error: error.message }
  }
}

// =============================================================================
// CONTENT CREATION
// =============================================================================

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
    let message = `Check out what I saw today${photo?.video ? ' (video)' : ''}`
    const url = `https://link.wisaw.com/photos/${photo.id}`

    if (photoDetails?.comments && photoDetails.comments.length > 0) {
      message += `\n\n${photoDetails.comments
        .slice(0, 3)
        .map((comment) => comment.comment)
        .join('\n\n')}`
    }

    return {
      title: 'WiSaw - What I Saw Today',
      message,
      url,
      subject: 'WiSaw: Check out what I saw today',
    }
  }

  if (type === 'friend' && friendshipUuid) {
    const url = `https://link.wisaw.com/friends/${friendshipUuid}`
    const message = `${contactName}, you've got a WiSaw friendship request. Make sure you have Wisaw App installed from the app store. To confirm, follow the url: ${url}`

    return {
      title: 'WiSaw Friendship Request',
      message,
      url,
      subject: 'WiSaw friendship request',
    }
  }

  return null
}

// =============================================================================
// SHARING METHODS
// =============================================================================

/**
 * Share via SMS using Expo SMS
 */
export const shareViaSMS = async ({ content, phoneNumber = null }) => {
  try {
    const isAvailable = await SMS.isAvailableAsync()
    if (!isAvailable) {
      throw new Error('SMS is not available on this device')
    }

    const smsOptions = {
      body: content.message,
    }

    if (phoneNumber) {
      smsOptions.recipients = [phoneNumber]
    }

    const result = await SMS.sendSMSAsync(
      smsOptions.recipients || [],
      smsOptions.body,
    )
    return { success: result.result === 'sent', result }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('SMS share error:', error)
    throw error
  }
}

/**
 * Share using React Native's native Share API
 */
export const shareWithNativeSheet = async ({
  type,
  photo,
  photoDetails,
  friendshipUuid,
  contactName,
}) => {
  try {
    const content = createShareContent({
      type,
      photo,
      photoDetails,
      friendshipUuid,
      contactName,
    })

    if (!content) {
      throw new Error('Invalid sharing content')
    }

    const result = await Share.share(
      {
        title: content.title,
        message:
          Platform.OS === 'ios'
            ? content.message
            : `${content.title}\n\n${content.message}`,
        url: Platform.OS === 'ios' ? content.url : undefined,
      },
      {
        subject: content.subject,
        dialogTitle: content.title,
        excludedActivityTypes: [
          'com.apple.UIKit.activity.Print',
          'com.apple.UIKit.activity.AssignToContact',
          'com.apple.UIKit.activity.SaveToCameraRoll',
        ],
      },
    )

    if (result.action === Share.sharedAction) {
      return {
        success: true,
        activityType: result.activityType,
      }
    }

    if (result.action === Share.dismissedAction) {
      return {
        success: false,
        dismissed: true,
      }
    }

    return { success: false }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Native share error:', error)
    throw error
  }
}

/**
 * Share to specific app with deep linking
 */
export const shareToSpecificApp = async ({
  app,
  type,
  photo,
  photoDetails,
  friendshipUuid,
  contactName,
}) => {
  try {
    const content = createShareContent({
      type,
      photo,
      photoDetails,
      friendshipUuid,
      contactName,
    })

    if (!content) {
      throw new Error('Invalid sharing content')
    }

    const scheme = APP_SCHEMES[app.toLowerCase()]
    if (!scheme) {
      throw new Error(`Unsupported app: ${app}`)
    }

    const isInstalled = await isAppInstalled(scheme)
    if (!isInstalled) {
      throw new Error(`${app} is not installed`)
    }

    let shareUrl = ''
    const encodedMessage = encodeURIComponent(content.message)
    const encodedUrl = encodeURIComponent(content.url)

    switch (app.toLowerCase()) {
      case 'whatsapp':
        // Use specialized WhatsApp function for better preview support
        const whatsappResult = await shareToWhatsApp(content)
        return whatsappResult
      case 'telegram':
        // Telegram also benefits from URL separation for previews
        const telegramMessage = `${content.message}\n\n${content.url}`
        shareUrl = `tg://msg?text=${encodeURIComponent(telegramMessage)}`
        break
      case 'twitter':
        shareUrl = `twitter://post?message=${encodedMessage}`
        break
      case 'facebook':
        shareUrl = `fb://share?url=${encodedUrl}`
        break
      case 'imessage':
        // iMessage also needs the URL included
        const imessageMessage = `${content.message}\n\n${content.url}`
        shareUrl = `sms:&body=${encodeURIComponent(imessageMessage)}`
        break
      default:
        // For apps without specific URL formats, try opening the app
        shareUrl = scheme
    }

    await Linking.openURL(shareUrl)
    return { success: true }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`${app} share error:`, error)
    throw error
  }
}

/**
 * Get list of available installed apps for sharing
 */
export const getAvailableApps = async () => {
  const availableApps = []

  // eslint-disable-next-line no-restricted-syntax
  for (const [appName, scheme] of Object.entries(APP_SCHEMES)) {
    // eslint-disable-next-line no-await-in-loop
    const installed = await isAppInstalled(scheme)
    if (installed) {
      availableApps.push({
        id: appName,
        name: formatAppName(appName),
        scheme,
      })
    }
  }

  return availableApps
}

/**
 * Comprehensive share with multiple options and fallbacks
 */
export const comprehensiveShare = async ({
  type,
  photo,
  photoDetails,
  friendshipUuid,
  contactName,
  preferredMethod = 'native',
}) => {
  try {
    // Try preferred method first
    if (preferredMethod === 'native') {
      return await shareWithNativeSheet({
        type,
        photo,
        photoDetails,
        friendshipUuid,
        contactName,
      })
    }

    // If specific app preference, try that
    if (preferredMethod !== 'native') {
      return await shareToSpecificApp({
        app: preferredMethod,
        type,
        photo,
        photoDetails,
        friendshipUuid,
        contactName,
      })
    }

    return { success: false, error: 'Invalid preferred method' }
  } catch (error) {
    // Fallback to native share if specific app fails
    try {
      return await shareWithNativeSheet({
        type,
        photo,
        photoDetails,
        friendshipUuid,
        contactName,
      })
    } catch (fallbackError) {
      // eslint-disable-next-line no-console
      console.error('All sharing methods failed:', fallbackError)
      throw fallbackError
    }
  }
}

// =============================================================================
// SPECIALIZED SHARING FUNCTIONS
// =============================================================================

/**
 * Enhanced WhatsApp sharing with multiple fallback methods
 */
export const shareToWhatsApp = async (content) => {
  try {
    if (!content || !content.message || !content.url) {
      throw new Error('Invalid content for WhatsApp sharing')
    }

    // Check if WhatsApp is installed
    const whatsappInstalled = await isAppInstalled('whatsapp://send')
    if (!whatsappInstalled) {
      throw new Error('WhatsApp is not installed')
    }

    // Optional: Check if URL is accessible (for debugging)
    const urlCheck = await checkUrlForPreview(content.url)
    if (!urlCheck.accessible) {
      console.warn('URL may not be accessible for previews:', urlCheck)
    }

    // Method 1: Try URL-first approach (sometimes works better for previews)
    try {
      const urlFirstMessage = `${content.url}\n\n${content.message}`
      const urlFirstLink = `https://wa.me/?text=${encodeURIComponent(urlFirstMessage)}`

      console.log('Attempting WhatsApp URL-first approach:', urlFirstLink)
      await Linking.openURL(urlFirstLink)
      return { success: true, method: 'url_first_universal' }
    } catch (urlFirstError) {
      console.log(
        'URL-first approach failed, trying standard message format:',
        urlFirstError.message,
      )

      // Method 2: Try standard message format with universal link
      const message = `${content.message}\n\n${content.url}`
      const universalLink = `https://wa.me/?text=${encodeURIComponent(message)}`

      try {
        console.log('Attempting WhatsApp universal link:', universalLink)
        await Linking.openURL(universalLink)
        return { success: true, method: 'universal' }
      } catch (universalError) {
        console.log(
          'Universal link failed, trying deep link:',
          universalError.message,
        )

        // Method 3: Fallback to deep link
        const deepLink = `whatsapp://send?text=${encodeURIComponent(message)}`

        try {
          console.log('Attempting WhatsApp deep link:', deepLink)
          await Linking.openURL(deepLink)
          return { success: true, method: 'deep_link' }
        } catch (deepLinkError) {
          console.log('Deep link failed:', deepLinkError.message)
          throw new Error('All WhatsApp sharing methods failed')
        }
      }
    }
  } catch (error) {
    console.error('WhatsApp share error:', error)
    throw error
  }
}

/**
 * Alternative WhatsApp sharing with URL-first approach
 */
export const shareToWhatsAppUrlFirst = async (content) => {
  try {
    if (!content || !content.message || !content.url) {
      throw new Error('Invalid content for WhatsApp sharing')
    }

    // Check if WhatsApp is installed
    const whatsappInstalled = await isAppInstalled('whatsapp://send')
    if (!whatsappInstalled) {
      throw new Error('WhatsApp is not installed')
    }

    // Try URL-first approach - sometimes WhatsApp previews work better this way
    const urlFirstMessage = `${content.url}\n\n${content.message}`
    const universalLink = `https://wa.me/?text=${encodeURIComponent(urlFirstMessage)}`

    console.log('Attempting WhatsApp URL-first approach:', universalLink)
    await Linking.openURL(universalLink)
    return { success: true, method: 'url_first' }
  } catch (error) {
    console.error('WhatsApp URL-first share error:', error)
    throw error
  }
}

// =============================================================================
// LEGACY SUPPORT
// =============================================================================

/**
 * Legacy photo sharing function for backward compatibility
 */
export const sharePhoto = async (photo, photoDetails) =>
  shareWithNativeSheet({
    type: 'photo',
    photo,
    photoDetails,
  })

/**
 * Show sharing options with available apps
 */
export const showSharingOptions = async ({
  type,
  photo,
  photoDetails,
  friendshipUuid,
  contactName,
}) => {
  try {
    const availableApps = await getAvailableApps()

    const options = [
      'Share with system sheet',
      'Send via SMS',
      ...availableApps.map((app) => `Share to ${app.name}`),
      'Cancel',
    ]

    Alert.alert('Share', 'Choose how to share:', [
      ...options.slice(0, -1).map((option, index) => ({
        text: option,
        onPress: async () => {
          try {
            if (index === 0) {
              // Native share
              await shareWithNativeSheet({
                type,
                photo,
                photoDetails,
                friendshipUuid,
                contactName,
              })
            } else if (index === 1) {
              // SMS
              const content = createShareContent({
                type,
                photo,
                photoDetails,
                friendshipUuid,
                contactName,
              })
              await shareViaSMS({ content })
            } else {
              // Specific app
              const appIndex = index - 2
              const app = availableApps[appIndex]
              if (app) {
                await shareToSpecificApp({
                  app: app.id,
                  type,
                  photo,
                  photoDetails,
                  friendshipUuid,
                  contactName,
                })
              }
            }
          } catch (err) {
            Alert.alert('Error', `Failed to share: ${err.message}`)
          }
        },
      })),
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ])
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error showing sharing options:', error)
    Alert.alert('Error', 'Failed to load sharing options')
  }
}
