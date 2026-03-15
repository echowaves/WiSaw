import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import AppHeader from '../../src/components/AppHeader'
import PhotoSelectionMode from '../../src/screens/PhotoSelectionMode'

export default function PhotoSelectionScreen() {
  const router = useRouter()
  const { waveName } = useLocalSearchParams()

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <AppHeader
              onBack={() => router.back()}
              title={`Add to: ${String(waveName || 'Wave')}`}
            />
          )
        }}
      />
      <PhotoSelectionMode />
    </>
  )
}
