import { router, useRootNavigationState } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'

// This component catches unmatched routes (like deep link URLs that don't match file structure)
// and redirects to home. Our deep link handler in _layout.tsx will then process the URL properly.
export default function NotFound () {
  const rootNavigationState = useRootNavigationState()

  useEffect(() => {
    // Wait for navigation to be ready before redirecting
    if (!rootNavigationState?.key) {
      console.log('[NotFound] Navigation not ready yet')
      return
    }

    console.log('[NotFound] Redirecting to home')
    // Redirect to home after a small delay to ensure navigation is stable
    const timer = setTimeout(() => {
      router.replace('/')
    }, 50)

    return () => clearTimeout(timer)
  }, [rootNavigationState?.key])

  // Return empty view while redirecting
  return <View />
}
