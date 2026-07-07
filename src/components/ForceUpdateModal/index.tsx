import { Ionicons } from '@expo/vector-icons'
import * as Updates from 'expo-updates'
import { useAtom } from 'jotai'
import React, { useMemo } from 'react'
import {
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import * as STATE from '../../state'
import { getTheme } from '../../theme/sharedStyles'

interface ForceUpdateModalProps {
  /** The message to display. Falls back to defaults if empty. */
  message?: string
  /** Which threshold triggered: build, version, or both */
  triggerType: 'build' | 'version' | 'both'
}

const DEFAULT_MESSAGES = {
  build: 'A new version is ready. Tap Reload to update.',
  version: 'A new version is available. Please update from the App Store / Google Play.',
  both: 'A new version is available. Please update from the App Store / Google Play.'
}

// App store URLs — WiSaw package name
const IOS_APP_STORE_ID = '1482598170'
const GOOGLE_PLAY_PACKAGE = 'com.echowaves.wisaw'

/**
 * ForceUpdateModal — full-screen blocking overlay that prevents all app interaction.
 * Shown when the device's build or version is below the backend-required minimum.
 */
export default function ForceUpdateModal ({ message, triggerType }: ForceUpdateModalProps) {
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const theme = useMemo(() => getTheme(isDarkMode), [isDarkMode])

  const displayMessage = message && message.trim().length > 0
    ? message
    : DEFAULT_MESSAGES[triggerType]

  const handleAction = async () => {
    if (triggerType === 'build') {
      // Build update: reload EAS Updates JS bundle
      try {
        await Updates.reloadAsync()
      } catch {
        // Silently fail if reload fails
      }
    } else {
      // Version update (or both): open app store for native app update
      const url = Platform.OS === 'ios'
        ? `https://apps.apple.com/app/id${IOS_APP_STORE_ID}`
        : `https://play.google.com/store/apps/details?id=${GOOGLE_PLAY_PACKAGE}`
      try {
        const supported = await Linking.canOpenURL(url)
        if (supported) {
          await Linking.openURL(url)
        }
      } catch {
        // Silently fail if app store open fails
      }
    }
  }

  const styles = useMemo(() => createStyles(theme, triggerType), [theme, triggerType])

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Ionicons name="alert-circle" size={48} color={theme.INTERACTIVE_PRIMARY} />
        <Text style={styles.title}>Update Required</Text>
        <Text style={styles.message}>{displayMessage}</Text>
        <TouchableOpacity style={styles.button} onPress={handleAction} activeOpacity={0.8}>
          <Text style={styles.buttonText}>
            {triggerType === 'version' || triggerType === 'both' ? 'Update Now' : 'Reload'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function createStyles (theme: any, triggerType: string) {
  return StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 9999,
      justifyContent: 'center',
      alignItems: 'center'
    },
    card: {
      width: '85%',
      maxWidth: 400,
      backgroundColor: theme.BACKGROUND,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.TEXT_PRIMARY,
      marginTop: 12,
      marginBottom: 8,
      textAlign: 'center'
    },
    message: {
      fontSize: 15,
      color: theme.TEXT_SECONDARY,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 24
    },
    button: {
      backgroundColor: theme.INTERACTIVE_PRIMARY,
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 12,
      minWidth: 160,
      alignItems: 'center'
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600'
    }
  })
}
