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
import { router, Stack, useRootNavigationState } from 'expo-router'
import * as ScreenOrientation from 'expo-screen-orientation'
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

type PendingDeepLink = {
  url: string
  linkData: NonNullable<ReturnType<typeof parseDeepLink>>
}

export default function RootLayout() {
  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [nickName, setNickName] = useAtom(STATE.nickName)
  const [isDarkMode, setIsDarkMode] = useAtom(STATE.isDarkMode)
  const [followSystemTheme, setFollowSystemTheme] = useAtom(
    STATE.followSystemTheme,
  )
  const [isAppReady, setIsAppReady] = useState(false)
  const rootNavigationState = useRootNavigationState()
  const isNavigationReady = !!rootNavigationState?.key
  const pendingDeepLinkRef = useRef<PendingDeepLink | null>(null)

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
  const processDeepLink = useCallback((linkData) => {
    console.log('🔗 processDeepLink called with:', linkData)
    try {
      // Don't dismiss all - we want to maintain the nav stack

      switch (linkData.type) {
        case 'photo':
          console.log('📸 Navigating to shared photo:', linkData.photoId)
          // Navigate to home first, then push the deep link target
          router.replace('/')
          // Use router.push with a microtask to ensure home screen is mounted
          queueMicrotask(() => {
            router.push(`/shared/${linkData.photoId}`)
          })
          break
        case 'friend':
          console.log(
            '👤 Navigating to friend confirmation:',
            linkData.friendshipUuid,
          )
          // Navigate to home first, then push the deep link target
          router.replace('/')
          // Use router.push with a microtask to ensure home screen is mounted
          queueMicrotask(() => {
            router.push(`/confirm-friendship/${linkData.friendshipUuid}`)
          })
          break
        case 'friendshipName':
          console.log(
            '✏️ Processing friendship name update:',
            linkData.friendshipUuid,
            linkData.friendName,
          )
          router.replace('/friends')

          // Process the name update asynchronously without blocking
          ;(async () => {
            try {
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

              const Toast = (await import('react-native-toast-message')).default
              Toast.show({
                text1: 'Friend name updated!',
                text2: `Updated to "${linkData.friendName}"`,
                type: 'success',
                topOffset: 100,
              })
            } catch (error) {
              console.error('Error updating friend name:', error)
              const Toast = (await import('react-native-toast-message')).default
              Toast.show({
                text1: 'Update failed',
                text2: 'Could not update friend name',
                type: 'error',
                topOffset: 100,
              })
            }
          })()
          break
        default:
          console.log('Unknown link type, navigating to home')
          router.replace('/')
      }
    } catch (navError) {
      console.error('Error during navigation:', navError)
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
  }, [])

  // Capture initial URL on mount (once)
  useEffect(() => {
    let isMounted = true

    Linking.getInitialURL()
      .then((url) => {
        if (!isMounted || !url) return

        console.log('📎 Initial URL detected:', url)
        const linkData = parseDeepLink(url)

        if (linkData) {
          console.log('Queuing initial deep link')
          pendingDeepLinkRef.current = { url, linkData }
        }
      })
      .catch((error) => {
        console.error('Error getting initial URL:', error)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Handle runtime deep links (app already open)
  useEffect(() => {
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('� Runtime URL event:', event.url)
      const linkData = parseDeepLink(event.url)

      if (linkData) {
        // App is already running, navigation should be ready
        console.log('Processing runtime link immediately')
        try {
          processDeepLink(linkData)
        } catch (error) {
          console.error('Error processing runtime link:', error)
        }
      }
    })

    return () => subscription?.remove()
  }, [processDeepLink])

  // Process queued deep link with aggressive fallback
  useEffect(() => {
    if (!pendingDeepLinkRef.current) return

    const { linkData } = pendingDeepLinkRef.current
    console.log('🔄 Checking if can process queued link:', {
      isNavigationReady,
      isAppReady,
    })

    if (isNavigationReady) {
      console.log('✅ Navigation ready, processing queued deep link now')
      try {
        processDeepLink(linkData)
        pendingDeepLinkRef.current = null
      } catch (error) {
        console.error('Error processing queued deep link:', error)
        pendingDeepLinkRef.current = null
      }
      return
    }

    // Fallback: If navigation isn't ready after app init completes,
    // force process after a short delay
    if (isAppReady) {
      const fallbackTimer = setTimeout(() => {
        if (pendingDeepLinkRef.current) {
          console.log('⏰ Fallback: forcing deep link navigation after delay')
          try {
            processDeepLink(linkData)
          } catch (error) {
            console.error('Error in fallback deep link processing:', error)
          } finally {
            pendingDeepLinkRef.current = null
          }
        }
      }, 500) // Give navigation 500ms to become ready after app init

      return () => clearTimeout(fallbackTimer)
    }
  }, [isNavigationReady, isAppReady, processDeepLink])

  useEffect(() => {
    const initStartTime = Date.now()
    console.log('🎯 App initialization starting:', new Date().toISOString())

    const runInit = async () => {
      const startTime = Date.now()
      console.log(
        '🚀 Starting app initialization at:',
        new Date().toISOString(),
      )

      try {
        const initStartTime = Date.now()
        console.log('📱 initializeApp started at:', new Date().toISOString())

        // Load each preference individually with specific timeouts to identify issues
        console.log('🔍 Loading UUID...')
        const uuidStart = Date.now()
        const fetchedUuid = await SecretReducer.getUUID()
          .then((result) => {
            console.log(
              '✅ UUID loaded in',
              Date.now() - uuidStart,
              'ms:',
              result ? 'exists' : 'generated',
            )
            return result
          })
          .catch((error) => {
            console.error(
              '❌ UUID loading failed after',
              Date.now() - uuidStart,
              'ms:',
              error,
            )
            return '' // Return default
          })

        console.log('🔍 Loading NickName...')
        const nickNameStart = Date.now()
        const fetchedNickName = await SecretReducer.getStoredNickName()
          .then((result) => {
            console.log(
              '✅ NickName loaded in',
              Date.now() - nickNameStart,
              'ms:',
              result ? 'exists' : 'empty',
            )
            return result
          })
          .catch((error) => {
            console.error(
              '❌ NickName loading failed after',
              Date.now() - nickNameStart,
              'ms:',
              error,
            )
            return '' // Return default
          })

        console.log('🔍 Loading Theme Preference...')
        const themeStart = Date.now()
        const savedThemePreference = await loadThemePreference()
          .then((result) => {
            console.log(
              '✅ Theme preference loaded in',
              Date.now() - themeStart,
              'ms:',
              result,
            )
            return result
          })
          .catch((error) => {
            console.error(
              '❌ Theme preference loading failed after',
              Date.now() - themeStart,
              'ms:',
              error,
            )
            return false // Return default
          })

        console.log('🔍 Loading Follow System Preference...')
        const followSystemStart = Date.now()
        const savedFollowSystemPreference = await loadFollowSystemPreference()
          .then((result) => {
            console.log(
              '✅ Follow system preference loaded in',
              Date.now() - followSystemStart,
              'ms:',
              result,
            )
            return result
          })
          .catch((error) => {
            console.error(
              '❌ Follow system preference loading failed after',
              Date.now() - followSystemStart,
              'ms:',
              error,
            )
            return false // Return default
          })

        console.log('🔧 Setting app state...')
        setUuid(fetchedUuid)
        setNickName(fetchedNickName)
        setIsDarkMode(savedThemePreference)
        setFollowSystemTheme(savedFollowSystemPreference)

        // If following system theme, set to current system theme
        if (savedFollowSystemPreference) {
          const systemTheme = getSystemTheme()
          console.log('🎨 Setting system theme:', systemTheme)
          setIsDarkMode(systemTheme)
        }

        console.log(
          '✅ App initialization complete in',
          Date.now() - initStartTime,
          'ms! Total time:',
          Date.now() - startTime,
          'ms',
        )
        setIsAppReady(true) // Mark app as ready after data is loaded
      } catch (error) {
        console.error('❌ Error during app initialization:', error)
        // Set defaults if initialization fails to prevent hanging
        setUuid('') // Will be generated later if needed
        setNickName('')
        setIsDarkMode(false)
        setFollowSystemTheme(false)
        console.log('⚠️ Using default values, app marked ready')
        setIsAppReady(true) // Still mark as ready to allow app to continue

        // Show toast notification about initialization error
        Toast.show({
          text1: 'App Initialization Warning',
          text2: 'Some settings may not be available',
          type: 'error',
          position: 'top',
          topOffset: 60,
          visibilityTime: 4000,
        })
      }

      try {
        console.log('📱 Setting screen orientation...')
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP,
        )
        console.log('✅ Screen orientation set')
      } catch (error) {
        console.error('❌ Error setting screen orientation:', error)
        // Don't let orientation lock failure prevent app startup
        Toast.show({
          text1: 'Screen Orientation Error',
          text2: 'Unable to lock portrait mode',
          type: 'error',
          position: 'top',
          topOffset: 60,
          visibilityTime: 3000,
        })
      }
    }

    runInit()

    // Safety timeout - if app doesn't become ready within 5 seconds, force it ready
    const safetyTimeout = setTimeout(() => {
      if (!isAppReady) {
        const elapsedTime = Date.now() - initStartTime
        console.warn(
          '⏰ App initialization timeout after',
          elapsedTime,
          'ms - forcing ready state',
        )
        console.warn('📊 Current state snapshot:', {
          fontsLoaded,
          fontError,
          isAppReady,
          hasPendingLink: !!pendingDeepLinkRef.current,
        })
        setIsAppReady(true)
        // Toast notification removed per user request
      }
    }, 5000)

    return () => {
      console.log('🧹 Cleaning up init useEffect')
      clearTimeout(safetyTimeout)
    }
  }, []) // Empty dependency array - run only once

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

  // Hide splash as soon as app initialization completes
  useEffect(() => {
    if (isAppReady) {
      console.log('🎉 App initialized, hiding splash screen...')

      SplashScreen.hideAsync()
        .then(() => {
          console.log('✅ Splash screen hidden')
        })
        .catch((error) => {
          console.error('❌ Error hiding splash screen:', error)
        })
    }
  }, [isAppReady])

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
