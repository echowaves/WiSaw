import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import AppHeader from '../../../../src/components/AppHeader'
import PhotosDetailsShared from '../../../../src/screens/PhotosDetailsShared'

export default function SharedPhotoDetail() {
  const { photoId } = useLocalSearchParams()
  const [refreshKey, setRefreshKey] = useState(0)

  // Refresh comments when screen comes back into focus (e.g., after adding a comment)
  useFocusEffect(
    useCallback(() => {
      // Trigger a refresh by updating the key
      setRefreshKey((prev) => prev + 1)
    }, []),
  )

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <AppHeader
              debugId="photo-details"
              onBack={() => router.back()}
              title="Shared Photo"
              rightSlot={<View style={{ width: 44, height: 44 }} />}
            />
          ),
        }}
      />
      <PhotosDetailsShared route={{ params: { photoId, refreshKey } }} />
    </>
  )
}
