import { useLocalSearchParams } from 'expo-router'
import PhotosDetailsShared from '../../../../src/screens/PhotosDetailsShared'

export default function SharedPhotoDetail() {
  const { photoId } = useLocalSearchParams()

  return <PhotosDetailsShared route={{ params: { photoId } }} />
}
