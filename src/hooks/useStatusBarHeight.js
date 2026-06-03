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
