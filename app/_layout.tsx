import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { createTheme, ThemeProvider } from '@rneui/themed'
import { useFonts } from 'expo-font'
import * as Linking from 'expo-linking'
import { router, Stack } from 'expo-router'
import * as ScreenOrientation from 'expo-screen-orientation'
import * as SplashScreen from 'expo-splash-screen'
import { useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { InteractionManager } from 'react-native'
import Toast from 'react-native-toast-message'

import * as CONST from '../src/consts'
import * as SecretReducer from '../src/screens/Secret/reducer'
import * as STATE from '../src/state'
import { parseDeepLink } from '../src/utils/linkingHelper'

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

  const init = useCallback(async () => {
    // Use InteractionManager to defer expensive operations
    InteractionManager.runAfterInteractions(async () => {
      const [fetchedUuid, fetchedNickName] = await Promise.all([
        SecretReducer.getUUID(),
        SecretReducer.getStoredNickName(),
      ])
      setUuid(fetchedUuid)
      setNickName(fetchedNickName)
    })

    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
  }, [setUuid, setNickName])

  // Handle deep linking
  const handleDeepLink = useCallback((url: string) => {
    console.log('Deep link received:', url)

    const linkData = parseDeepLink(url)
    console.log('Parsed link data:', linkData)

    if (linkData) {
      // Add a small delay to ensure the app is fully loaded
      setTimeout(() => {
        switch (linkData.type) {
          case 'photo':
            console.log('Navigating to shared photo:', linkData.photoId)
            router.push(`/shared/${linkData.photoId}`)
            break
          case 'friend':
            console.log(
              'Navigating to friend confirmation:',
              linkData.friendshipUuid,
            )
            router.push(`/confirm-friendship/${linkData.friendshipUuid}`)
            break
          default:
            console.log('Unknown link type, navigating to home')
            router.push('/')
        }
      }, 1500) // 1.5 second delay to ensure app is ready
    }
  }, [])

  useEffect(() => {
    // Handle initial URL when app is opened via deep link
    const getInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL()
        if (initialUrl) {
          console.log('Initial URL detected:', initialUrl)
          handleDeepLink(initialUrl)
        } else {
          console.log('No initial URL found')
        }
      } catch (error) {
        console.error('Error getting initial URL:', error)
      }
    }

    // Handle URLs when app is already running
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('URL event received:', event.url)
      handleDeepLink(event.url)
    })

    // Wait a bit for the app to initialize before checking for initial URL
    const timer = setTimeout(() => {
      getInitialURL()
    }, 2000)

    return () => {
      subscription?.remove()
      clearTimeout(timer)
    }
  }, [handleDeepLink])

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (fontsLoaded) {
      // Small delay to ensure smooth transition
      setTimeout(() => {
        SplashScreen.hideAsync()
      }, 100)
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
