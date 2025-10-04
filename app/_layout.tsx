import 'react-native-get-random-values' // Must be imported before uuid

import {
  AntDesign,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from '@expo/vector-icons'
import { createTheme, ThemeProvider } from '@rneui/themed'
import { useFonts } from 'expo-font'
import * as Linking from 'expo-linking'
import { router, Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
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
  const [isSplashHidden, setIsSplashHidden] = useState(false)
  const hasMarkedReadyRef = useRef(false)
  const hasProcessedInitialUrlRef = useRef(false)

  const markAppReady = useCallback(() => {
    setIsAppReady(() => {
      hasMarkedReadyRef.current = true
      return true
    })
  }, [setIsAppReady])

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

  // Load vector icon fonts (does not block rendering)
  const [fontsLoaded, fontError] = useFonts({
    ...FontAwesome.font,
    ...FontAwesome5.font,
    ...MaterialIcons.font,
    ...Ionicons.font,
    ...AntDesign.font,
  })

  useEffect(() => {
    if (fontsLoaded) {
      console.log('✅ Fonts loaded successfully')
    }
  }, [fontsLoaded])

  useEffect(() => {
    if (fontError) {
      console.error('❌ Font loading error:', fontError)
      Toast.show({
        text1: 'Font Loading Error',
        text2: 'Some icons may not display correctly',
        type: 'error',
        position: 'top',
        topOffset: 60,
        visibilityTime: 3000,
      })
    }
  }, [fontError])

  // Handle deep linking
  const handleDeepLink = useCallback(
    (url: string) => {
      try {
        console.log('Deep link received:', url)

        const linkData = parseDeepLink(url)
        console.log('Parsed link data:', linkData)

        if (linkData) {
          // Navigate function - reset nav stack and navigate cleanly
          const navigateToLink = () => {
            try {
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
                    router.push(
                      `/confirm-friendship/${linkData.friendshipUuid}`,
                    )
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
            } catch (navError) {
              console.error('Error during navigation:', navError)
              // Fallback to home page
              router.replace('/')
              Toast.show({
                text1: 'Navigation Error',
                text2: 'Unable to navigate to requested content',
                type: 'error',
                position: 'top',
                topOffset: 60,
                visibilityTime: 4000,
              })
            }
          }

          const isFullyReady =
            (fontsLoaded || !!fontError) && isAppReady && isSplashHidden

          if (isFullyReady) {
            // If app is fully ready and splash is hidden, navigate immediately
            console.log(
              'App fully ready (splash hidden), navigating immediately',
            )
            navigateToLink()
          } else {
            // If app not ready yet, wait for splash to hide
            console.log('App not fully ready, waiting for splash to hide...')
            const checkInterval = setInterval(() => {
              const nowReady =
                (fontsLoaded || !!fontError) && isAppReady && isSplashHidden
              if (nowReady) {
                console.log('App now ready, navigating')
                clearInterval(checkInterval)
                navigateToLink()
              }
            }, 100)
            // Safety timeout after 5 seconds
            setTimeout(() => {
              clearInterval(checkInterval)
              console.warn(
                'Timeout waiting for app ready, navigating anyway...',
              )
              navigateToLink()
            }, 5000)
          }
        }
      } catch (error) {
        console.error('Error handling deep link:', error)
        // Fallback to home page if deep linking completely fails
        if ((fontsLoaded || !!fontError) && isAppReady) {
          router.replace('/')
        }
        Toast.show({
          text1: 'Deep Link Error',
          text2: 'Unable to process shared link',
          type: 'error',
          position: 'top',
          topOffset: 60,
          visibilityTime: 4000,
        })
      }
    },
    [fontsLoaded, fontError, isAppReady, isSplashHidden],
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
        // Don't let deep linking errors prevent app startup
        Toast.show({
          text1: 'Link Loading Error',
          text2: 'Unable to process app link on startup',
          type: 'error',
          position: 'top',
          topOffset: 60,
          visibilityTime: 3000,
        })
      }
    }

    // Handle URLs when app is already running
    const subscription = Linking.addEventListener('url', (event) => {
      try {
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
              console.log('Unknown link type, fallback to home')
              router.replace('/')
          }
        }
      } catch (error) {
        console.error('Error in URL event handler:', error)
        Toast.show({
          text1: 'Link Processing Error',
          text2: 'Unable to handle shared link',
          type: 'error',
          position: 'top',
          topOffset: 60,
          visibilityTime: 3000,
        })
      }
    })

    // Get initial URL only once after app is fully ready (including splash hidden)
    const isFullyReady =
      (fontsLoaded || !!fontError) && isAppReady && isSplashHidden

    if (isFullyReady && !hasProcessedInitialUrlRef.current) {
      console.log('🔗 App fully ready, checking for initial deep link')
      hasProcessedInitialUrlRef.current = true
      getInitialURL()
    }

    return () => {
      subscription?.remove()
    }
  }, [fontsLoaded, fontError, isAppReady, isSplashHidden, handleDeepLink])

  useEffect(() => {
    let isCancelled = false

    const safetyTimeout = setTimeout(() => {
      if (isCancelled || hasMarkedReadyRef.current) return
      console.warn(
        '⏰ App initialization exceeded timeout (2.5s), forcing ready state',
      )
      markAppReady()
    }, 2500)

    const initialize = async () => {
      try {
        console.log('🚀 Initializing app preferences...')
        const startTime = Date.now()

        const [
          uuidResult,
          nickNameResult,
          themePreferenceResult,
          followSystemResult,
        ] = await Promise.allSettled([
          SecretReducer.getUUID(),
          SecretReducer.getStoredNickName(),
          loadThemePreference(),
          loadFollowSystemPreference(),
        ])

        console.log(`⏱️ Preferences loaded in ${Date.now() - startTime}ms`)

        if (isCancelled) return

        const resolvedUuid =
          uuidResult.status === 'fulfilled' && uuidResult.value
            ? uuidResult.value
            : ''
        const resolvedNickName =
          nickNameResult.status === 'fulfilled' && nickNameResult.value
            ? nickNameResult.value
            : ''
        const resolvedThemePreference =
          themePreferenceResult.status === 'fulfilled'
            ? !!themePreferenceResult.value
            : false
        const resolvedFollowSystem =
          followSystemResult.status === 'fulfilled'
            ? !!followSystemResult.value
            : false

        setUuid(resolvedUuid)
        setNickName(resolvedNickName)
        setFollowSystemTheme(resolvedFollowSystem)
        setIsDarkMode(
          resolvedFollowSystem ? getSystemTheme() : resolvedThemePreference,
        )

        console.log('✅ App state set, marking app as ready')
      } catch (error) {
        if (isCancelled) return

        console.error('❌ Error during app initialization:', error)
        setUuid('')
        setNickName('')
        setIsDarkMode(false)
        setFollowSystemTheme(false)

        Toast.show({
          text1: 'App Initialization Warning',
          text2: 'Some settings may not be available',
          type: 'error',
          position: 'top',
          topOffset: 60,
          visibilityTime: 4000,
        })
      } finally {
        clearTimeout(safetyTimeout)
        if (!isCancelled) {
          console.log('📱 Marking app as ready')
          markAppReady()
        }
      }
    }

    console.log('🎬 Starting initialization...')
    initialize()

    return () => {
      isCancelled = true
      clearTimeout(safetyTimeout)
    }
  }, [markAppReady, setFollowSystemTheme, setIsDarkMode, setNickName, setUuid])

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

  // Hide splash once resources and app state are ready
  useEffect(() => {
    const canHideSplash = isAppReady && (fontsLoaded || !!fontError)

    if (!canHideSplash) return
    if (isSplashHidden) return // Already hidden

    console.log('🎉 App initialized, hiding splash screen...')

    SplashScreen.hideAsync()
      .then(() => {
        console.log('✅ Splash screen hidden')
        setIsSplashHidden(true)
      })
      .catch((error) => {
        console.error('❌ Error hiding splash screen:', error)
        // Mark as hidden anyway to not block app
        setIsSplashHidden(true)
      })
  }, [isAppReady, fontsLoaded, fontError, isSplashHidden])

  // Emergency splash hide - MUST run only once on mount, no dependencies
  useEffect(() => {
    const emergencyTimer = setTimeout(() => {
      if (!isSplashHidden) {
        console.warn('⚠️ Emergency splash hide triggered after 3 seconds')
        SplashScreen.hideAsync()
          .then(() => {
            console.log('✅ Emergency splash hide succeeded')
            setIsSplashHidden(true)
          })
          .catch((error) => {
            console.error('❌ Emergency splash hide failed:', error)
            setIsSplashHidden(true)
          })
      }
    }, 3000)

    return () => clearTimeout(emergencyTimer)
  }, [isSplashHidden])

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        </Stack>
        <Toast />
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
