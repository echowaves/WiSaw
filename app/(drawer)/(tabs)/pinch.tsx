import { useLocalSearchParams, useRouter } from 'expo-router'
import PinchableView from '../../../src/components/Photo/PinchableView'

export default function PinchScreen () {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { photo } = params

  // Parse the photo back from JSON string
  const parsedPhoto = photo ? JSON.parse(photo as string) : {}

  const navigation = {
    goBack: () => router.back(),
    navigate: (routeName: string, params?: any) => router.push(routeName)
  }

  return (
    <PinchableView
      route={{ params: { photo: parsedPhoto } }}
      navigation={navigation}
    />
  )
}
