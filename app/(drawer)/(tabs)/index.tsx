import { Stack } from 'expo-router'
import PhotosList from '../../../src/screens/PhotosList'

export default function Index() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PhotosList />
    </>
  )
}
