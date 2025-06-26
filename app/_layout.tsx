import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { createTheme, ThemeProvider } from '@rneui/themed'
import { useFonts } from 'expo-font'
import * as Linking from 'expo-linking'
import { router, Stack } from 'expo-router'
import * as ScreenOrientation from 'expo-screen-orientation'
import * as SplashScreen from 'expo-splash-screen'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
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
  const [isAppReady, setIsAppReady] = useState(false)

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
      setIsAppReady(true) // Mark app as ready after data is loaded
    })

    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
  }, [setUuid, setNickName])

  // Hot reload fix: Re-initialize if UUID is missing but app is ready
  useEffect(() => {
    if (isAppReady && (!uuid || uuid.length === 0)) {
      init()
    }
  }, [isAppReady, uuid, init])

  // Handle deep linking
  const handleDeepLink = useCallback(
    (url: string) => {
      console.log('Deep link received:', url)

      const linkData = parseDeepLink(url)
      console.log('Parsed link data:', linkData)

      if (linkData) {
        // Navigate immediately if app is ready, otherwise wait briefly
        const navigateToLink = () => {
          // Reset navigation stack to ensure clean state
          router.dismissAll()

          switch (linkData.type) {
            case 'photo':
              console.log('Navigating to shared photo:', linkData.photoId)
              // Navigate to home first to establish a proper navigation stack
              router.replace('/')
              // Then navigate to the photo, creating a proper back navigation
              setTimeout(() => {
                router.push(`/shared/${linkData.photoId}`)
              }, 50)
              break
            case 'friend':
              console.log(
                'Navigating to friend confirmation:',
                linkData.friendshipUuid,
              )
              // Navigate to home first to establish a proper navigation stack
              router.replace('/')
              // Then navigate to friend confirmation
              setTimeout(() => {
                router.push(`/confirm-friendship/${linkData.friendshipUuid}`)
              }, 50)
              break
            default:
              console.log('Unknown link type, navigating to home')
              router.replace('/')
          }
        }

        if (fontsLoaded && isAppReady) {
          // If app is fully ready, navigate immediately
          console.log('App ready, navigating immediately')
          navigateToLink()
        } else {
          // If app not ready yet, wait briefly
          console.log('App not ready, waiting briefly...')
          setTimeout(navigateToLink, 200)
        }
      }
    },
    [fontsLoaded, isAppReady],
  )

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
      console.log('URL event received while app running:', event.url)
      // When app is already running, navigate immediately
      const linkData = parseDeepLink(event.url)
      if (linkData) {
        console.log('App already running, resetting nav stack and navigating')

        // Reset navigation stack first
        router.dismissAll()

        switch (linkData.type) {
          case 'photo':
            // Navigate to home first to establish proper navigation stack
            router.replace('/')
            setTimeout(() => {
              router.push(`/shared/${linkData.photoId}`)
            }, 50)
            break
          case 'friend':
            // Navigate to home first to establish proper navigation stack
            router.replace('/')
            setTimeout(() => {
              router.push(`/confirm-friendship/${linkData.friendshipUuid}`)
            }, 50)
            break
          default:
            router.replace('/')
        }
      }
    })

    // Check for initial URL immediately if fonts are loaded
    if (fontsLoaded) {
      getInitialURL()
    } else {
      // If fonts not loaded, wait very briefly
      const timer = setTimeout(getInitialURL, 100)
      return () => {
        subscription?.remove()
        clearTimeout(timer)
      }
    }

    return () => subscription?.remove()
  }, [handleDeepLink, fontsLoaded])

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (fontsLoaded && isAppReady) {
      // Hide splash screen only when everything is ready
      setTimeout(() => {
        SplashScreen.hideAsync()
      }, 100)
    }
  }, [fontsLoaded, isAppReady])

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
