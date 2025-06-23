import { useLocalSearchParams } from 'expo-router'
import PhotosDetails from '../../../../src/screens/PhotosDetails'

export default function PhotoDetail() {
  const params = useLocalSearchParams()
  const { id, index, photosList, searchTerm, activeSegment, topOffset, uuid } =
    params

  // Parse the photosList back from JSON string
  const parsedPhotosList = photosList ? JSON.parse(photosList as string) : []

  // Convert route parameters to the format expected by PhotosDetails
  const routeParams = {
    index: Number(index),
    photosList: parsedPhotosList,
    searchTerm,
    activeSegment: Number(activeSegment),
    topOffset: Number(topOffset),
    uuid,
  }

  return <PhotosDetails route={{ params: routeParams }} />
}
