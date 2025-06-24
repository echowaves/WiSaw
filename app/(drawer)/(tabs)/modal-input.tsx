import { Ionicons } from '@expo/vector-icons'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import ModalInputText from '../../../src/screens/ModalInputText'

export default function ModalInputScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
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
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                padding: 12,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                marginHorizontal: 8,
              }}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          },
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: '600',
            color: '#fff',
          },
          headerTintColor: '#fff',
          headerTransparent: true,
        }}
      />
      <ModalInputText route={{ params: routeParams }} />
    </>
  )
}
