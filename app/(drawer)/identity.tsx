import { Stack, useRouter } from 'expo-router'
import AppHeader from '../../src/components/AppHeader'
import IdentityScreen from '../../src/screens/Secret'

export default function Identity () {
  const router = useRouter()

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <AppHeader onBack={() => router.back()} title='Identity' />
          )
        }}
      />
      <IdentityScreen />
    </>
  )
}
