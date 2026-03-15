import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import AppHeader from '../../src/components/AppHeader'
import WaveDetail from '../../src/screens/WaveDetail'

export default function WaveDetailScreen() {
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
              title={String(waveName || 'Wave')}
            />
          )
        }}
      />
      <WaveDetail />
    </>
  )
}
