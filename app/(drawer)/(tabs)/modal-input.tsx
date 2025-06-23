import { useLocalSearchParams } from 'expo-router'
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

  return <ModalInputText route={{ params: routeParams }} />
}
