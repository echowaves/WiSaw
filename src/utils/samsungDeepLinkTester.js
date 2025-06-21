import * as Linking from 'expo-linking'
import { Alert } from 'react-native'

/**
 * Samsung Deep Link Testing Utility
 *
 * This utility provides debugging functions to help test deep linking on Samsung devices.
 * It can be imported and used temporarily during testing.
 */

/**
 * Test if deep linking is working on Samsung devices
 * Call this function from a button press or on app startup to debug
 */
export const testSamsungDeepLinks = async () => {
  const testResults = []

  try {
    // Test 1: Check if getInitialURL works
    const initialUrl = await Linking.getInitialURL()
    testResults.push(`Initial URL: ${initialUrl || 'None'}`)

    // Test 2: Test URL parsing for different Samsung patterns
    const testUrls = [
      'https://link.wisaw.com/photos/12345',
      'https://wisaw.com/photos/12345',
      'https://link.wisaw.com/friends/abc-123',
      'https://wisaw.com/friends/abc-123',
      'wisaw://photos/12345',
      'wisaw://friends/abc-123',
    ]

    testUrls.forEach((url) => {
      try {
        const parsed = Linking.parse(url)
        testResults.push(`URL: ${url}`)
        testResults.push(`  Parsed: ${JSON.stringify(parsed, null, 2)}`)
      } catch (error) {
        testResults.push(`URL: ${url} - ERROR: ${error.message}`)
      }
    })

    // Test 3: Check if we can open URLs
    const canOpenHttp = await Linking.canOpenURL('https://wisaw.com')
    testResults.push(`Can open HTTPS: ${canOpenHttp}`)

    const canOpenCustom = await Linking.canOpenURL('wisaw://test')
    testResults.push(`Can open custom scheme: ${canOpenCustom}`)

    // Show results
    Alert.alert('Samsung Deep Link Test Results', testResults.join('\n'), [
      {
        text: 'Copy to Clipboard',
        onPress: () => {
          // You could add clipboard functionality here if needed
        },
      },
      { text: 'OK' },
    ])
  } catch (error) {
    Alert.alert('Test Error', error.message)
  }
}

/**
 * Force test a specific deep link URL
 * Call this with a URL to test how it would be handled
 */
export const testSpecificUrl = async (url, navigation) => {
  try {
    // Import the actual handler
    const linkingHelper = await import('./linkingAndSharingHelper')

    Alert.alert('Testing Deep Link', `Testing URL: ${url}`, [
      {
        text: 'Test',
        onPress: () => {
          // This would call the actual handler
          linkingHelper.handleDeepLink({ url, navigation })
        },
      },
      { text: 'Cancel' },
    ])
  } catch (error) {
    Alert.alert('Test Error', error.message)
  }
}

/**
 * Log current Samsung device information
 */
export const logSamsungDeviceInfo = () => {
  const deviceInfo = {
    userAgent: navigator?.userAgent || 'Not available',
    platform: navigator?.platform || 'Not available',
    // Add more device-specific info as needed
  }

  Alert.alert('Samsung Device Info', JSON.stringify(deviceInfo, null, 2))
}

export default {
  testSamsungDeepLinks,
  testSpecificUrl,
  logSamsungDeviceInfo,
}
