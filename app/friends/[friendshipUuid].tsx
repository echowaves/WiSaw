import { router, useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'

// Deep-link trampoline: matches /friends/[friendshipUuid] URL paths
// (https://[link.]wisaw.com/friends/:uuid and wisaw://friends/:uuid).
//
// On mount it resets the navigation stack to home and pushes the friendship
// confirmation on top, so the resulting stack is [home, confirm] and the
// back button always returns to the landing screen.
export default function FriendDeepLinkTrampoline (): React.JSX.Element {
  const { friendshipUuid } = useLocalSearchParams()

  useEffect(() => {
    if (typeof friendshipUuid !== 'string' || friendshipUuid.length === 0) {
      router.replace('/')
      return
    }

    console.log('Deep link trampoline: navigating to confirm-friendship', friendshipUuid)
    router.dismissAll()
    router.replace('/')
    // Small delay lets the reset settle before pushing the confirm screen.
    setTimeout(() => {
      router.push(`/confirm-friendship/${friendshipUuid}`)
    }, 100)
  }, [friendshipUuid])

  return <View />
}
