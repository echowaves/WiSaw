import { router, useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'

// Deep-link trampoline: matches /photos/[photoId] URL paths (both
// https://[link.]wisaw.com/photos/:id and wisaw://photos/:id).
//
// On mount it resets the navigation stack to home and pushes the shared
// photo detail on top, so the resulting stack is [home, photo detail] and
// the back button always returns to the landing screen.
//
// Used for BOTH cold start (expo-router resolves the initial URL here)
// and warm start (expo-router's internal url listener resolves incoming
// links here) — no manual deep-link handler is needed in _layout.tsx.
export default function PhotoDeepLinkTrampoline (): React.JSX.Element {
  const { photoId } = useLocalSearchParams()

  useEffect(() => {
    if (typeof photoId !== 'string' || photoId.length === 0) {
      router.replace('/')
      return
    }

    console.log('Deep link trampoline: navigating to shared photo', photoId)
    router.dismissAll()
    router.replace('/')
    // Small delay lets the reset settle before pushing the detail screen.
    setTimeout(() => {
      router.push(`/shared/${photoId}`)
    }, 100)
  }, [photoId])

  return <View />
}
