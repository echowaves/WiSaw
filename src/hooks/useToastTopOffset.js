import { useMemo } from 'react'
import { Platform, StatusBar } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const DEFAULT_EXTRA_OFFSET = 40
const MIN_PADDING = 8

/**
 * Calculates a consistent top offset for Toast notifications using the device
 * safe-area inset and platform-specific status bar height. The optional
 * `extraOffset` allows screens with custom headers to push the toast further
 * down without relying on global state.
 */
const useToastTopOffset = (extraOffset = DEFAULT_EXTRA_OFFSET) => {
  const { top } = useSafeAreaInsets()

  return useMemo(() => {
    const androidStatusBar =
      Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0

    return Math.max(top, androidStatusBar, MIN_PADDING) + extraOffset
  }, [extraOffset, top])
}

export default useToastTopOffset
