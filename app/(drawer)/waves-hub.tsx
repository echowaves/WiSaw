import { Stack, useRouter } from 'expo-router'
import AppHeader from '../../src/components/AppHeader'
import WavesHub from '../../src/screens/WavesHub'

export default function WavesHubScreen() {
  const router = useRouter()

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <AppHeader
              onBack={() => router.back()}
              title='Waves'
            />
          )
        }}
      />
      <WavesHub />
    </>
  )
}
