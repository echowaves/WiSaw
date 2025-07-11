import { Platform, StatusBar } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

/**
 * Custom hook to get consistent status bar height across platforms
 * @returns {number} Status bar height for the current platform
 */
export const useStatusBarHeight = () => {
  const insets = useSafeAreaInsets()

  if (Platform.OS === 'android') {
    return StatusBar.currentHeight || 0
  }

  // iOS uses safe area insets
  return insets.top
}

/**
 * Custom hook to get header styles with proper status bar handling
 * @param {Object} baseStyle - Base header style object
 * @returns {Object} Header style with platform-specific adjustments
 */
export const useHeaderStyle = (baseStyle = {}) => {
  const statusBarHeight = useStatusBarHeight()

  return {
    ...baseStyle,
    ...(Platform.OS === 'android' && {
      paddingTop: statusBarHeight,
      height: (baseStyle.height || 56) + statusBarHeight,
    }),
  }
}

/**
 * Custom hook for SafeAreaView styles with status bar padding
 * @param {Object} baseStyle - Base SafeAreaView style object
 * @returns {Object} SafeAreaView style with platform-specific padding
 */
export const useSafeAreaViewStyle = (baseStyle = {}) => {
  const statusBarHeight = useStatusBarHeight()

  return {
    ...baseStyle,
    ...(Platform.OS === 'android' && {
      paddingTop: statusBarHeight,
    }),
  }
}
