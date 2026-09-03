import { router, useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'

// Deep-link trampoline: matches /wave/invite/[inviteToken] URL paths
// (https://[link.]wisaw.com/wave/invite/:token and wisaw://wave/invite/:token).
//
// On mount it resets the navigation stack to home and pushes the wave join
// screen on top, so the resulting stack is [home, wave join] and the back
// button always returns to the landing screen.
export default function WaveInviteDeepLinkTrampoline (): React.JSX.Element {
  const { inviteToken } = useLocalSearchParams()

  useEffect(() => {
    if (typeof inviteToken !== 'string' || inviteToken.length === 0) {
      router.replace('/')
      return
    }

    console.log('Deep link trampoline: navigating to wave invite join', inviteToken)
    router.dismissAll()
    router.replace('/')
    // Small delay lets the reset settle before pushing the join screen.
    setTimeout(() => {
      router.push({ pathname: '/waves/join', params: { inviteToken } })
    }, 100)
  }, [inviteToken])

  return <View />
}
