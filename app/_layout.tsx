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
import { getTheme } from '../src/theme/sharedStyles'
import { parseDeepLink } from '../src/utils/linkingHelper'
import {
  getSystemTheme,
  loadFollowSystemPreference,
  loadThemePreference,
  subscribeToSystemTheme,
} from '../src/utils/themeStorage'

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [nickName, setNickName] = useAtom(STATE.nickName)
  const [isDarkMode, setIsDarkMode] = useAtom(STATE.isDarkMode)
  const [followSystemTheme, setFollowSystemTheme] = useAtom(
    STATE.followSystemTheme,
  )
  const [isAppReady, setIsAppReady] = useState(false)

  // Create dynamic theme based on dark mode state
  const currentTheme = getTheme(isDarkMode)
  const theme = createTheme({
    mode: isDarkMode ? 'dark' : 'light',
    lightColors: {
      primary: CONST.MAIN_COLOR,
      secondary: currentTheme.TEXT_SECONDARY,
      success: currentTheme.STATUS_SUCCESS,
      warning: currentTheme.STATUS_WARNING,
      error: currentTheme.STATUS_ERROR,
      background: currentTheme.BACKGROUND,
    },
    darkColors: {
      primary: CONST.MAIN_COLOR,
      secondary: currentTheme.TEXT_SECONDARY,
      success: currentTheme.STATUS_SUCCESS,
      warning: currentTheme.STATUS_WARNING,
      error: currentTheme.STATUS_ERROR,
      background: currentTheme.BACKGROUND,
    },
    components: {
      Button: {
        titleStyle: {
          color: '#FFFFFF', // Keep button text white for contrast with colored backgrounds
        },
      },
      Text: {
        style: {
          color: currentTheme.TEXT_PRIMARY,
        },
      },
    },
  })

  // Load the fonts used by vector-icons
  const [fontsLoaded] = useFonts({
    ...FontAwesome.font,
    ...FontAwesome5.font,
    ...MaterialIcons.font,
  })

  const init = useCallback(async () => {
    // Use InteractionManager to defer expensive operations
    InteractionManager.runAfterInteractions(async () => {
      const [
        fetchedUuid,
        fetchedNickName,
        savedThemePreference,
        savedFollowSystemPreference,
      ] = await Promise.all([
        SecretReducer.getUUID(),
        SecretReducer.getStoredNickName(),
        loadThemePreference(),
        loadFollowSystemPreference(),
      ])
      setUuid(fetchedUuid)
      setNickName(fetchedNickName)
      setIsDarkMode(savedThemePreference)
      setFollowSystemTheme(savedFollowSystemPreference)

      // If following system theme, set to current system theme
      if (savedFollowSystemPreference) {
        setIsDarkMode(getSystemTheme())
      }

      setIsAppReady(true) // Mark app as ready after data is loaded
    })

    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
  }, [setUuid, setNickName, setIsDarkMode, setFollowSystemTheme])

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
            case 'friendshipName':
              console.log(
                'Processing friendship name update:',
                linkData.friendshipUuid,
                linkData.friendName,
              )
              // Navigate to friends list and trigger name update
              router.replace('/friends')
              // Trigger friendship name update after navigation
              setTimeout(async () => {
                try {
                  // Get current user UUID
                  const secretReducer = await import(
                    '../src/screens/Secret/reducer'
                  )
                  const currentUuid = await secretReducer.getUUID()

                  const friendsHelper = await import(
                    '../src/screens/FriendsList/friends_helper'
                  )
                  await friendsHelper.setContactName({
                    uuid: currentUuid,
                    friendshipUuid: linkData.friendshipUuid,
                    contactName: linkData.friendName,
                  })

                  // Show success message
                  const Toast = (await import('react-native-toast-message'))
                    .default
                  Toast.show({
                    text1: 'Friend name updated!',
                    text2: `Updated to "${linkData.friendName}"`,
                    type: 'success',
                    topOffset: 100,
                  })
                } catch (error) {
                  console.error('Error updating friend name:', error)
                  const Toast = (await import('react-native-toast-message'))
                    .default
                  Toast.show({
                    text1: 'Update failed',
                    text2: 'Could not update friend name',
                    type: 'error',
                    topOffset: 100,
                  })
                }
              }, 100)
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
          case 'friendshipName':
            console.log(
              'Processing friendship name update while app running:',
              linkData.friendshipUuid,
              linkData.friendName,
            )
            // Navigate to friends list and trigger name update
            router.replace('/friends')
            // Trigger friendship name update after navigation
            setTimeout(async () => {
              try {
                // Get current user UUID
                const secretReducer = await import(
                  '../src/screens/Secret/reducer'
                )
                const currentUuid = await secretReducer.getUUID()

                const friendsHelper = await import(
                  '../src/screens/FriendsList/friends_helper'
                )
                await friendsHelper.setContactName({
                  uuid: currentUuid,
                  friendshipUuid: linkData.friendshipUuid,
                  contactName: linkData.friendName,
                })

                // Show success message
                const Toast = (await import('react-native-toast-message'))
                  .default
                Toast.show({
                  text1: 'Friend name updated!',
                  text2: `Updated to "${linkData.friendName}"`,
                  type: 'success',
                  topOffset: 100,
                })
              } catch (error) {
                console.error('Error updating friend name:', error)
                const Toast = (await import('react-native-toast-message'))
                  .default
                Toast.show({
                  text1: 'Update failed',
                  text2: 'Could not update friend name',
                  type: 'error',
                  topOffset: 100,
                })
              }
            }, 100)
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

  // Subscribe to system theme changes
  useEffect(() => {
    if (followSystemTheme) {
      // Set initial system theme
      const currentSystemTheme = getSystemTheme()
      setIsDarkMode(currentSystemTheme)

      // Subscribe to changes
      const subscription = subscribeToSystemTheme((isDark) => {
        setIsDarkMode(isDark)
      })
      return () => {
        subscription?.remove()
      }
    }
  }, [followSystemTheme, setIsDarkMode])

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
