import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useCallback, useState } from 'react'
import PhotosDetailsShared from '../../../../src/screens/PhotosDetailsShared'

export default function SharedPhotoDetail () {
  const { photoId } = useLocalSearchParams()
  const [refreshKey, setRefreshKey] = useState(0)

  // Refresh comments when screen comes back into focus (e.g., after adding a comment)
  useFocusEffect(
    useCallback(() => {
      // Trigger a refresh by updating the key
      setRefreshKey((prev) => prev + 1)
    }, [])
  )

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false // Hide the Stack header since we use custom overlay
        }}
      />
      <PhotosDetailsShared route={{ params: { photoId, refreshKey } }} />
    </>
  )
}
