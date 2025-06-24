import { Stack, useLocalSearchParams } from 'expo-router'
import ModalInputText from '../../../src/screens/ModalInputText'

export default function ModalInputScreen() {
  const params = useLocalSearchParams()
  const { photo, uuid, topOffset } = params

  // Parse the photo back from JSON string
  const parsedPhoto = photo ? JSON.parse(photo as string) : {}

  const routeParams = {
    photo: parsedPhoto,
    uuid,
    topOffset: Number(topOffset),
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add Comment',
          headerBackTitle: '',
          headerStyle: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
            color: '#fff',
          },
          headerTintColor: '#fff',
          headerTransparent: false,
        }}
      />
      <ModalInputText route={{ params: routeParams }} />
    </>
  )
}
