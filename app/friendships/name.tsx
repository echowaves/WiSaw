import { router, useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'

// This component handles deep linking for friendship QR codes
// It's not meant to be displayed, just processes the deep link and redirects
export default function FriendshipNameHandler () {
  const params = useLocalSearchParams()

  useEffect(() => {
    // Handle the deep link data here if needed
    // For now, just redirect to the main app since this is a deep link handler
    router.replace('/(drawer)/(tabs)')
  }, [])

  // Return an empty view since this is just a handler
  return <View />
}
