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

  // Single source of truth for app readiness
  const [isFullyReady, setIsFullyReady] = useState(false)
  const pendingDeepLinkRef = useRef<string | null>(null)
  const hasProcessedInitialUrlRef = useRef(false)

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
          color: '#FFFFFF',
        },
      },
      Text: {
        style: {
          color: currentTheme.TEXT_PRIMARY,
        },
      },
    },
  })

  // Load vector icon fonts
  const [fontsLoaded, fontError] = useFonts({
    ...FontAwesome.font,
    ...FontAwesome5.font,
    ...MaterialIcons.font,
    ...Ionicons.font,
    ...AntDesign.font,
  })

  // Navigate to deep link target
  const navigateToDeepLink = useCallback(async (linkData: any) => {
    try {
      // Reset navigation stack to ensure clean state
      router.dismissAll()

      switch (linkData.type) {
        case 'photo':
          console.log('Navigating to shared photo:', linkData.photoId)
          router.replace('/')
          setTimeout(() => {
            router.push(`/shared/${linkData.photoId}`)
          }, 100)
          break

        case 'friend':
          console.log(
            'Navigating to friend confirmation:',
            linkData.friendshipUuid,
          )
          router.replace('/')
          setTimeout(() => {
            router.push(`/confirm-friendship/${linkData.friendshipUuid}`)
          }, 100)
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
              const currentUuid = await SecretReducer.getUUID()
              const friendsHelper = await import(
                '../src/screens/FriendsList/friends_helper'
              )
              await friendsHelper.setContactName({
                uuid: currentUuid,
                friendshipUuid: linkData.friendshipUuid,
                contactName: linkData.friendName,
              })

              Toast.show({
                text1: 'Friend name updated!',
                text2: `Updated to "${linkData.friendName}"`,
                type: 'success',
                topOffset: 100,
              })
            } catch (error) {
              console.error('Error updating friend name:', error)
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
    } catch (error) {
      console.error('Error during navigation:', error)
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

  // Handle deep link
  const handleDeepLink = useCallback(
    (url: string) => {
      console.log('Deep link received:', url)
      const linkData = parseDeepLink(url)

      if (!linkData) {
        console.log('Invalid deep link format')
        return
      }

      if (isFullyReady) {
        // App is ready, navigate immediately
        console.log('App is ready, navigating to deep link')
        navigateToDeepLink(linkData)
      } else {
        // Store link for later processing
        console.log('App not ready, storing deep link for later')
        pendingDeepLinkRef.current = url
      }
    },
    [isFullyReady, navigateToDeepLink],
  )

  // Initialize app state
  useEffect(() => {
    let isCancelled = false

    const initialize = async () => {
      try {
        console.log('🚀 Initializing app...')
        const startTime = Date.now()

        // Load all preferences in parallel
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

        if (isCancelled) return

        // Set state with resolved values
        setUuid(uuidResult.status === 'fulfilled' ? uuidResult.value || '' : '')
        setNickName(
          nickNameResult.status === 'fulfilled'
            ? nickNameResult.value || ''
            : '',
        )
        setFollowSystemTheme(
          followSystemResult.status === 'fulfilled'
            ? !!followSystemResult.value
            : false,
        )

        const followSystem =
          followSystemResult.status === 'fulfilled'
            ? !!followSystemResult.value
            : false
        const themePreference =
          themePreferenceResult.status === 'fulfilled'
            ? !!themePreferenceResult.value
            : false
        setIsDarkMode(followSystem ? getSystemTheme() : themePreference)

        console.log(`✅ App state initialized in ${Date.now() - startTime}ms`)
      } catch (error) {
        console.error('❌ Error during initialization:', error)
        // Set default values
        setUuid('')
        setNickName('')
        setIsDarkMode(false)
        setFollowSystemTheme(false)
      }
    }

    initialize()
    return () => {
      isCancelled = true
    }
  }, [setFollowSystemTheme, setIsDarkMode, setNickName, setUuid])

  // Subscribe to system theme changes
  useEffect(() => {
    if (followSystemTheme) {
      setIsDarkMode(getSystemTheme())
      const subscription = subscribeToSystemTheme(setIsDarkMode)
      return () => subscription?.remove()
    }
  }, [followSystemTheme, setIsDarkMode])

  // Mark app as fully ready when all resources are loaded
  useEffect(() => {
    // Check if all resources are ready
    const resourcesReady = fontsLoaded || !!fontError
    const stateReady = uuid !== undefined // State has been initialized (even if empty)

    if (resourcesReady && stateReady && !isFullyReady) {
      console.log('✅ All resources loaded, app is fully ready')
      setIsFullyReady(true)

      // Hide splash screen
      SplashScreen.hideAsync().catch(console.error)

      // Process any pending deep link
      if (pendingDeepLinkRef.current) {
        console.log('Processing pending deep link')
        const url = pendingDeepLinkRef.current
        pendingDeepLinkRef.current = null
        setTimeout(() => handleDeepLink(url), 100)
      }
    }
  }, [fontsLoaded, fontError, uuid, isFullyReady, handleDeepLink])

  // Handle deep linking setup
  useEffect(() => {
    if (!isFullyReady) return

    // Get initial URL only once
    if (!hasProcessedInitialUrlRef.current) {
      hasProcessedInitialUrlRef.current = true

      Linking.getInitialURL()
        .then((url) => {
          if (url) {
            console.log('Initial URL detected:', url)
            handleDeepLink(url)
          }
        })
        .catch(console.error)
    }

    // Listen for URL changes while app is running
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('URL event received:', event.url)
      handleDeepLink(event.url)
    })

    return () => subscription?.remove()
  }, [isFullyReady, handleDeepLink])

  // Emergency timeout to prevent app from being stuck
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isFullyReady) {
        console.warn('⚠️ Emergency ready state after 5 seconds')
        setIsFullyReady(true)
        SplashScreen.hideAsync().catch(console.error)
      }
    }, 5000)

    return () => clearTimeout(timeout)
  }, [isFullyReady])

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
