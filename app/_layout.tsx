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

export default function RootLayout() {
  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [nickName, setNickName] = useAtom(STATE.nickName)
  const [isDarkMode, setIsDarkMode] = useAtom(STATE.isDarkMode)
  const [followSystemTheme, setFollowSystemTheme] = useAtom(
    STATE.followSystemTheme,
  )
  const [isAppReady, setIsAppReady] = useState(false)
  const [initStarted, setInitStarted] = useState(false)
  const rootNavigationState = useRootNavigationState()
  const isNavigationReady = !!rootNavigationState?.key
  const pendingDeepLinkRef = useRef(null)
  const lastHandledDeepLinkRef = useRef({ url: null, timestamp: 0 })

  useEffect(() => {
    if (isNavigationReady) {
      console.log('🧭 Root navigation is now ready')
    }
  }, [isNavigationReady])

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

  // Load the fonts used by vector-icons with timeout
  const [fontsLoaded, fontError] = useFonts({
    ...FontAwesome.font,
    ...FontAwesome5.font,
    ...MaterialIcons.font,
    ...Ionicons.font,
    ...AntDesign.font,
  })

  // Add font loading timeout
  const [fontLoadingTimedOut, setFontLoadingTimedOut] = useState(false)

  useEffect(() => {
    const fontTimeout = setTimeout(() => {
      if (!fontsLoaded) {
        console.warn('⚠️ Font loading timeout after 3 seconds')
        setFontLoadingTimedOut(true)
        Toast.show({
          text1: 'Font Loading Warning',
          text2: 'Some icons may not display correctly',
          type: 'error',
          position: 'top',
          topOffset: 60,
          visibilityTime: 3000,
        })
      }
    }, 2000) // 2 second timeout for fonts to avoid startup hang

    if (fontsLoaded) {
      clearTimeout(fontTimeout)
      console.log('✅ Fonts loaded successfully')
    }

    return () => clearTimeout(fontTimeout)
  }, [fontsLoaded])

  // Determine if we should proceed without waiting for fonts
  const shouldProceedWithoutFonts = fontLoadingTimedOut || fontError

  // Handle deep linking
  const processDeepLink = useCallback((linkData) => {
    try {
      router.dismissAll()

      switch (linkData.type) {
        case 'photo':
          console.log('Navigating to shared photo:', linkData.photoId)
          router.replace('/')
          setTimeout(() => {
            router.push(`/shared/${linkData.photoId}`)
          }, 50)
          break
        case 'friend':
          console.log(
            'Navigating to friend confirmation:',
            linkData.friendshipUuid,
          )
          router.replace('/')
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
          router.replace('/friends')
          setTimeout(async () => {
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
          }, 100)
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

  const handleDeepLink = useCallback(
    (url: string, options: { allowQueue?: boolean } = {}) => {
      const { allowQueue = true } = options
      if (!url) {
        return
      }

      const now = Date.now()
      const { url: lastUrl, timestamp } = lastHandledDeepLinkRef.current
      if (lastUrl === url && now - timestamp < 1000) {
        console.log('Skipping duplicate deep link within debounce window:', url)
        return
      }

      try {
        console.log('Deep link received:', url)

        const linkData = parseDeepLink(url)
        console.log('Parsed link data:', linkData)

        if (linkData) {
          const isLaunchReady =
            (fontsLoaded || shouldProceedWithoutFonts) && isAppReady
          const isFullyReady = isLaunchReady && isNavigationReady

          if (isFullyReady) {
            console.log('App and navigation ready, processing deep link now')
            processDeepLink(linkData)
            lastHandledDeepLinkRef.current = { url, timestamp: Date.now() }
            pendingDeepLinkRef.current = null
          } else if (allowQueue) {
            if (pendingDeepLinkRef.current?.url !== url) {
              console.log(
                'App navigation not ready yet, queueing deep link for later processing',
                {
                  isLaunchReady,
                  isNavigationReady,
                },
              )
            } else {
              console.log('Deep link already queued, waiting for readiness...')
            }
            pendingDeepLinkRef.current = { url, linkData }
          } else {
            console.log(
              'Queuing deep link as fallback while waiting for readiness',
              {
                isLaunchReady,
                isNavigationReady,
              },
            )
            pendingDeepLinkRef.current = { url, linkData }
          }
        }
      } catch (error) {
        console.error('Error handling deep link:', error)
        if ((fontsLoaded || shouldProceedWithoutFonts) && isAppReady) {
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
    [
      fontsLoaded,
      shouldProceedWithoutFonts,
      isAppReady,
      isNavigationReady,
      processDeepLink,
    ],
  )

  useEffect(() => {
    const isLaunchReady =
      (fontsLoaded || shouldProceedWithoutFonts) && isAppReady
    const isFullyReady = isLaunchReady && isNavigationReady
    if (isFullyReady && pendingDeepLinkRef.current) {
      const { url, linkData } = pendingDeepLinkRef.current
      console.log(
        'Processing queued deep link now that app and navigation are ready:',
        url,
      )
      try {
        processDeepLink(linkData)
        lastHandledDeepLinkRef.current = { url, timestamp: Date.now() }
      } catch (error) {
        console.error('Error processing queued deep link:', error)
      } finally {
        pendingDeepLinkRef.current = null
      }
    } else if (pendingDeepLinkRef.current && !isNavigationReady) {
      console.log(
        'Waiting for navigation to become ready before processing deep link',
      )
    }
  }, [
    fontsLoaded,
    shouldProceedWithoutFonts,
    isAppReady,
    isNavigationReady,
    processDeepLink,
  ])

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

        if (pendingDeepLinkRef.current?.url === event.url) {
          console.log(
            'Deep link matches queued startup link, waiting for initialization to finish',
          )
          return
        }

        const linkData = parseDeepLink(event.url)
        if (!linkData) {
          return
        }

        const isLaunchReady =
          (fontsLoaded || shouldProceedWithoutFonts) && isAppReady
        const isFullyReady = isLaunchReady && isNavigationReady
        if (isFullyReady) {
          console.log(
            'App already running, navigation ready — handling deep link now',
          )
          processDeepLink(linkData)
          lastHandledDeepLinkRef.current = {
            url: event.url,
            timestamp: Date.now(),
          }
        } else {
          console.log(
            'Runtime deep link received before readiness, queueing for later',
            {
              isLaunchReady,
              isNavigationReady,
            },
          )
          pendingDeepLinkRef.current = { url: event.url, linkData }
        }
      } catch (error) {
        console.error('Error handling deep link:', error)
        router.replace('/')
        Toast.show({
          text1: 'Link Processing Error',
          text2: 'Unable to open shared content',
          type: 'error',
          position: 'top',
          topOffset: 60,
          visibilityTime: 4000,
        })
      }
    })

    // Check for initial URL immediately if fonts are loaded or we're proceeding without them
    if (fontsLoaded || shouldProceedWithoutFonts) {
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
  }, [
    handleDeepLink,
    fontsLoaded,
    shouldProceedWithoutFonts,
    isAppReady,
    isNavigationReady,
    processDeepLink,
  ])

  useEffect(() => {
    // Only run initialization once
    if (initStarted) {
      console.log('🚫 Init already started, skipping...')
      return
    }

    setInitStarted(true)
    const initStartTime = Date.now()
    console.log('🎯 useEffect init called at:', new Date().toISOString())

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
        console.warn(
          '📊 Current state: fontsLoaded:',
          fontsLoaded,
          'fontError:',
          fontError,
          'fontTimedOut:',
          fontLoadingTimedOut,
          'isAppReady:',
          isAppReady,
        )
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

  useEffect(() => {
    const isLaunchReady =
      (fontsLoaded || shouldProceedWithoutFonts) && isAppReady
    let fallbackTimer

    if (isLaunchReady && !isNavigationReady) {
      console.log(
        'App data ready but waiting for navigation to initialize before hiding splash',
      )
      fallbackTimer = setTimeout(async () => {
        console.warn(
          'Navigation still initializing, forcing splash hide fallback',
        )
        try {
          await SplashScreen.hideAsync()
          console.log('✅ Splash screen hidden via fallback')
        } catch (error) {
          console.error('❌ Error hiding splash screen via fallback:', error)
        }
      }, 2000)
    }

    if (isLaunchReady && isNavigationReady) {
      // Hide splash screen only when everything is ready
      console.log('🎉 App and navigation ready, hiding splash screen...')
      setTimeout(async () => {
        try {
          await SplashScreen.hideAsync()
          console.log('✅ Splash screen hidden')
        } catch (error) {
          console.error('❌ Error hiding splash screen:', error)
          // Don't let splash screen hiding errors prevent app from working
          Toast.show({
            text1: 'Display Warning',
            text2: 'Splash screen may still be visible',
            type: 'error',
            position: 'top',
            topOffset: 60,
            visibilityTime: 3000,
          })
        }
      }, 100)
    }

    return () => {
      if (fallbackTimer) {
        clearTimeout(fallbackTimer)
      }
    }
  }, [fontsLoaded, shouldProceedWithoutFonts, isAppReady, isNavigationReady])

  if (!fontsLoaded && !shouldProceedWithoutFonts) {
    // Only block rendering if fonts are still loading and we haven't timed out
    return null
  }

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
