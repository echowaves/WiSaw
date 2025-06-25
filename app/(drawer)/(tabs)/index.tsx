import { Stack, useLocalSearchParams } from 'expo-router'
import PhotosList from '../../../src/screens/PhotosList'

export default function Index() {
  const params = useLocalSearchParams()
  const { search } = params

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PhotosList searchFromUrl={search as string} />
    </>
  )
}
