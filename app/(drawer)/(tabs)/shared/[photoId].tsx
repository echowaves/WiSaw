import { Stack, useLocalSearchParams } from 'expo-router'
import PhotosDetailsShared from '../../../../src/screens/PhotosDetailsShared'

export default function SharedPhotoDetail() {
  const { photoId } = useLocalSearchParams()

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Shared Photo',
          headerBackTitle: '',
        }}
      />
      <PhotosDetailsShared route={{ params: { photoId } }} />
    </>
  )
}
