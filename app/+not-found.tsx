import { router, useRootNavigationState } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'

// Catch-all for URLs that match no route in the app/ file structure.
// Valid deep links resolve natively via the redirect routes
// (app/photos/[photoId], app/friends/[friendshipUuid], app/wave/join/...,
// app/wave/invite/...), so this screen only sees malformed/unmatched URLs.
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
