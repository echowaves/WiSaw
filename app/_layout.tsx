import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { createTheme, ThemeProvider } from '@rneui/themed'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as ScreenOrientation from 'expo-screen-orientation'
import * as SplashScreen from 'expo-splash-screen'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import Toast from 'react-native-toast-message'

import * as CONST from '../src/consts'
import * as SecretReducer from '../src/screens/Secret/reducer'
import * as STATE from '../src/state'

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const theme = createTheme({})

  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [nickName, setNickName] = useAtom(STATE.nickName)

  // Load the fonts used by vector-icons
  const [fontsLoaded] = useFonts({
    ...FontAwesome.font,
    ...FontAwesome5.font,
    ...MaterialIcons.font,
  })

  const init = async () => {
    setUuid(await SecretReducer.getUUID())
    setNickName(await SecretReducer.getStoredNickName())
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
  }

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  return (
    <ThemeProvider theme={theme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerStyle: {
              backgroundColor: CONST.HEADER_GRADIENT_END,
            },
            headerTintColor: CONST.MAIN_COLOR,
          }}
        />
      </Stack>
      <Toast />
    </ThemeProvider>
  )
}
