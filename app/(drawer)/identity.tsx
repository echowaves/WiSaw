import { Stack, useRouter } from 'expo-router'
import AppHeader from '../../src/components/AppHeader'
import IdentityScreen from '../../src/screens/Secret'
import { ScreenIconTitle } from '../../src/theme/screenIcons'

export default function Identity () {
  const router = useRouter()

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <AppHeader onBack={() => router.back()} title={<ScreenIconTitle screenKey='identity' />} />
          )
        }}
      />
      <IdentityScreen />
    </>
  )
}
