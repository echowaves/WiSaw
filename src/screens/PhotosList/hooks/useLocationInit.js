import { useState } from 'react'

import * as Linking from 'expo-linking'
import * as Location from 'expo-location'
import Toast from 'react-native-toast-message'
import { Alert } from 'react-native'

export default function useLocationInit ({ toastTopOffset }) {
  const [location, setLocation] = useState({
    coords: { latitude: 0, longitude: 0 }
  })

  async function initLocation () {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'WiSaw shows you near-by photos based on your current location.',
        'You need to enable Location in Settings and Try Again.',
        [
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings()
            }
          }
        ]
      )
      return null
    }

    try {
      // initially set the location that is last known -- works much faster this way
      let loc = await Location.getLastKnownPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation
      })
      if (!loc) {
        loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation
        })
      }
      if (loc) setLocation(loc)

      return loc
    } catch (err12) {
      console.error({ err12 })
      Toast.show({
        text1: 'Unable to get location',
        type: 'error',
        topOffset: toastTopOffset
      })
    }
    return null
  }

  return { location, setLocation, initLocation }
}
