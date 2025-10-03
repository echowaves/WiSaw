import { useFocusEffect } from '@react-navigation/native'
import { Stack, useRouter } from 'expo-router'
import { useCallback } from 'react'
import { BackHandler } from 'react-native'
import Toast from 'react-native-toast-message'

import useToastTopOffset from '../src/hooks/useToastTopOffset'
import * as reducer from '../src/screens/PhotosList/reducer'
import TandCModal from '../src/screens/TandC'

export default function TandCModalScreen() {
  const router = useRouter()
  const toastTopOffset = useToastTopOffset()

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      )

      return () => {
        subscription.remove()
      }
    }, []),
  )

  const handleAccept = useCallback(() => {
    const accepted = reducer.acceptTandC()

    if (!accepted) {
      Toast.show({
        text1: 'Something went wrong',
        text2: 'Please try again in a moment.',
        type: 'error',
        position: 'top',
        topOffset: toastTopOffset,
        visibilityTime: 3000,
      })
      return
    }

    Toast.show({
      text1: 'Thanks for joining WiSaw',
      text2: 'Enjoy sharing moments with the community!',
      type: 'success',
      position: 'top',
      topOffset: toastTopOffset,
      visibilityTime: 2500,
    })

    router.back()
  }, [router, toastTopOffset])

  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'modal',
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <TandCModal onAccept={handleAccept} />
    </>
  )
}
