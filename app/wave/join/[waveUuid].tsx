import { router, useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'

// Deep-link trampoline: matches /wave/join/[waveUuid] URL paths
// (https://[link.]wisaw.com/wave/join/:uuid and wisaw://wave/join/:uuid).
//
// On mount it resets the navigation stack to home and pushes the wave join
// screen on top, so the resulting stack is [home, wave join] and the back
// button always returns to the landing screen.
export default function WaveJoinDeepLinkTrampoline (): React.JSX.Element {
  const { waveUuid } = useLocalSearchParams()

  useEffect(() => {
    if (typeof waveUuid !== 'string' || waveUuid.length === 0) {
      router.replace('/')
      return
    }

    console.log('Deep link trampoline: navigating to wave join', waveUuid)
    router.dismissAll()
    router.replace('/')
    // Small delay lets the reset settle before pushing the join screen.
    setTimeout(() => {
      router.push({ pathname: '/waves/join', params: { waveUuid } })
    }, 100)
  }, [waveUuid])

  return <View />
}
