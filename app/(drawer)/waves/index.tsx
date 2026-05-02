import { Stack } from 'expo-router'
import WavesHub from '../../../src/screens/WavesHub'

export default function WavesScreen () {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <WavesHub />
    </>
  )
}
