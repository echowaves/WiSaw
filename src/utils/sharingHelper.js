import * as SMS from 'expo-sms'
import { Alert, Linking, Platform, Share } from 'react-native'

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

// Format app name for display
const formatAppName = (appName) => {
  const nameMap = {
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
  return nameMap[appName] || appName.charAt(0).toUpperCase() + appName.slice(1)
}

// Check if an app is installed
const isAppInstalled = async (scheme) => {
  try {
    return await Linking.canOpenURL(scheme)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Error checking app availability:', error)
    return false
  }
}

// Create sharing content for different contexts
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
    const message = `${contactName}, you've got a WiSaw friendship request. To confirm, follow the url: ${url}`

    return {
      title: 'WiSaw Friendship Request',
      message,
      url,
      subject: 'WiSaw friendship request',
    }
  }

  return null
}

// Share via SMS using Expo SMS
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

// Share using React Native's native Share API
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

// Share to specific app with deep linking
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

// Get list of available sharing apps
export const getAvailableApps = async () => {
  const availableApps = []

  const appEntries = Object.entries(APP_SCHEMES)
  for (let i = 0; i < appEntries.length; i += 1) {
    const [appName, scheme] = appEntries[i]
    try {
      // eslint-disable-next-line no-await-in-loop
      const isAvailable = await isAppInstalled(scheme)
      if (isAvailable) {
        availableApps.push({
          name: appName,
          displayName: formatAppName(appName),
          scheme,
        })
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`Error checking ${appName}:`, error)
    }
  }

  return availableApps
}

// Comprehensive share function with multiple options
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

export default {
  shareWithNativeSheet,
  shareToSpecificApp,
  shareViaSMS,
  getAvailableApps,
  comprehensiveShare,
  createShareContent,
}
