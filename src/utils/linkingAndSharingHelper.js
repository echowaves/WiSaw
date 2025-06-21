import * as Linking from 'expo-linking'
import * as SMS from 'expo-sms'
import { Alert, Platform, Share } from 'react-native'

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

  // Messaging
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

// =============================================================================
// DEEP LINKING FUNCTIONALITY
// =============================================================================

/**
 * Handle deep link navigation
 */
const handleDeepLink = async ({ url, navigation }) => {
  if (!url) return

  try {
    // Parse the URL
    const { hostname, path, queryParams } = Linking.parse(url)

    // Normalize the path by removing leading/trailing slashes and query parameters
    const cleanPath = path ? path.replace(/^\/+|\/+$/g, '') : ''
    
    // Handle photo links with multiple patterns for Samsung compatibility
    if (cleanPath.includes('photos')) {
      let photoId = null
      
      // Try different patterns that Samsung devices might use
      if (cleanPath.includes('photos/')) {
        photoId = cleanPath
          .split('photos/')[1]
          ?.split('?')[0]
          ?.split('#')[0]
          ?.split('/')[0]
      } else if (cleanPath.includes('photos')) {
        // Handle cases where Samsung strips the slash
        const parts = cleanPath.split('photos')
        if (parts.length > 1) {
          photoId = parts[1]
            .replace(/^\/+/, '')
            .split('?')[0]
            ?.split('#')[0]
            ?.split('/')[0]
        }
      }

      if (photoId && photoId.trim()) {
        await navigation.popToTop()
        // Add delay for Samsung devices which sometimes need more time
        setTimeout(() => {
          navigation.navigate('PhotosDetailsShared', {
            photoId: photoId.trim(),
          })
        }, 300)
        return
      }
    }

    // Handle friendship links with multiple patterns for Samsung compatibility
    if (cleanPath.includes('friends')) {
      let friendshipUuid = null
      
      // Try different patterns that Samsung devices might use
      if (cleanPath.includes('friends/')) {
        friendshipUuid = cleanPath
          .split('friends/')[1]
          ?.split('?')[0]
          ?.split('#')[0]
          ?.split('/')[0]
      } else if (cleanPath.includes('friends')) {
        // Handle cases where Samsung strips the slash
        const parts = cleanPath.split('friends')
        if (parts.length > 1) {
          friendshipUuid = parts[1]
            .replace(/^\/+/, '')
            .split('?')[0]
            ?.split('#')[0]
            ?.split('/')[0]
        }
      }

      if (friendshipUuid && friendshipUuid.trim()) {
        await navigation.popToTop()
        // Add longer delay for Samsung devices for friendship navigation
        setTimeout(() => {
          navigation.navigate('ConfirmFriendship', {
            friendshipUuid: friendshipUuid.trim(),
          })
        }, 400)
        return
      }
    }

    // Handle query parameters for backward compatibility (legacy links)
    if (queryParams?.photoId) {
      await navigation.popToTop()
      setTimeout(() => {
        navigation.navigate('PhotosDetailsShared', {
          photoId: queryParams.photoId,
        })
      }, 300)
      return
    }

    if (queryParams?.friendshipUuid) {
      await navigation.popToTop()
      setTimeout(() => {
        navigation.navigate('ConfirmFriendship', {
          friendshipUuid: queryParams.friendshipUuid,
        })
      }, 400)
    }

    // Unhandled deep link - silently fail
  } catch (error) {
    // Error handling deep link - silently fail
    // eslint-disable-next-line no-console
    console.log('Deep link error:', error)
  }
}

/**
 * Initialize deep linking
 */
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
    const url = `https://link.wisaw.com/photos/${photo.id}`
    let message = `Check out what I saw today${photo?.video ? ' (video)' : ''}: ${url}`

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
        shareUrl = `whatsapp://send?text=${encodedMessage}`
        break
      case 'telegram':
        shareUrl = `tg://msg?text=${encodedMessage}`
        break
      case 'facebook':
        shareUrl = `fb://share?link=${encodedUrl}&quote=${encodedMessage}`
        break
      case 'twitter':
        shareUrl = `twitter://post?message=${encodedMessage}`
        break
      case 'linkedin':
        shareUrl = `linkedin://share?url=${encodedUrl}&summary=${encodedMessage}`
        break
      case 'instagram':
        Alert.alert(
          'Instagram Sharing',
          "Instagram doesn't support direct link sharing. The link has been copied to your clipboard. You can paste it in your Instagram story or post.",
          [{ text: 'OK' }],
        )
        return { success: false, reason: 'Instagram requires manual sharing' }
      case 'imessage':
      case 'sms':
        return shareViaSMS({ content })
      case 'gmail':
        shareUrl = `googlegmail://co?subject=${encodeURIComponent(content.subject)}&body=${encodedMessage}`
        break
      case 'outlook':
        shareUrl = `ms-outlook://compose?subject=${encodeURIComponent(content.subject)}&body=${encodedMessage}`
        break
      default:
        shareUrl = `${scheme}?text=${encodedMessage}`
    }

    if (shareUrl) {
      const canOpen = await Linking.canOpenURL(shareUrl)
      if (canOpen) {
        await Linking.openURL(shareUrl)
        return { success: true, app }
      }
      throw new Error(`Cannot open ${app}`)
    }

    return { success: false }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error sharing to ${app}:`, error)
    throw error
  }
}

/**
 * Simple photo sharing function (backward compatibility)
 * This replaces the sharePhoto function from linking_helper.js
 */
export const sharePhoto = async ({ photo, photoDetails }) => {
  try {
    const result = await shareWithNativeSheet({
      type: 'photo',
      photo,
      photoDetails,
    })

    return { success: result.success }
  } catch (error) {
    // Fallback to email if Share API fails
    try {
      const content = createShareContent({
        type: 'photo',
        photo,
        photoDetails,
      })

      if (content) {
        await Linking.openURL(
          `mailto:?subject=${encodeURIComponent(content.subject)}&body=${encodeURIComponent(content.message)}`,
        )
        return { success: true, method: 'email_fallback' }
      }

      Alert.alert('Error', 'Unable to share photo')
      return { success: false, error: 'No content to share' }
    } catch (emailError) {
      Alert.alert('Error', 'Unable to share photo')
      return { success: false, error: emailError }
    }
  }
}

/**
 * Get list of available sharing apps
 */
export const getAvailableApps = async () => {
  const availableApps = []

  const appEntries = Object.entries(APP_SCHEMES)
  const appChecks = appEntries.map(async ([appName, scheme]) => {
    try {
      const isAvailable = await isAppInstalled(scheme)
      if (isAvailable) {
        return {
          name: appName,
          displayName: formatAppName(appName),
          scheme,
        }
      }
      return null
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`Error checking ${appName}:`, error)
      return null
    }
  })

  const results = await Promise.all(appChecks)
  results.forEach((app) => {
    if (app) {
      availableApps.push(app)
    }
  })

  return availableApps
}

/**
 * Comprehensive share function with multiple options
 */
export const comprehensiveShare = async ({
  type,
  photo,
  photoDetails,
  friendshipUuid,
  contactName,
  preferredMethod = 'native',
  specificApp = null,
}) => {
  try {
    if (preferredMethod === 'specific' && specificApp) {
      return shareToSpecificApp({
        app: specificApp,
        type,
        photo,
        photoDetails,
        friendshipUuid,
        contactName,
      })
    }

    if (preferredMethod === 'native' || preferredMethod === 'auto') {
      return shareWithNativeSheet({
        type,
        photo,
        photoDetails,
        friendshipUuid,
        contactName,
      })
    }

    throw new Error('Invalid sharing method')
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Comprehensive share error:', error)

    // Fallback to email if all else fails
    const content = createShareContent({
      type,
      photo,
      photoDetails,
      friendshipUuid,
      contactName,
    })

    if (content) {
      const emailUrl = `mailto:?subject=${encodeURIComponent(content.subject)}&body=${encodeURIComponent(content.message)}`
      const canOpenEmail = await Linking.canOpenURL(emailUrl)

      if (canOpenEmail) {
        Alert.alert(
          'Share via Email',
          'Opening your default email app as fallback.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Email',
              onPress: () => Linking.openURL(emailUrl),
            },
          ],
        )
        return { success: true, method: 'email_fallback' }
      }
    }

    throw error
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

// Default export for backward compatibility
export default {
  // Sharing functions
  shareWithNativeSheet,
  shareToSpecificApp,
  shareViaSMS,
  getAvailableApps,
  comprehensiveShare,
  createShareContent,
  sharePhoto,

  // Linking functions
  initLinking,
}
