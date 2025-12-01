import 'react-native-get-random-values' // Must be imported before uuid

import {
  AntDesign,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialIcons
} from '@expo/vector-icons'
import { useFonts } from 'expo-font'
import * as Linking from 'expo-linking'
import { router, Stack, useRootNavigationState } from 'expo-router'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'
import { StatusBar } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

import ActiveWaveIndicator from '../src/components/ActiveWaveIndicator'
import * as SecretReducer from '../src/screens/Secret/reducer'
import * as STATE from '../src/state'
import { parseDeepLink } from '../src/utils/linkingHelper'
import {
  getSystemTheme,
  loadFollowSystemPreference,
  loadThemePreference,
  subscribeToSystemTheme
} from '../src/utils/themeStorage'

export default function RootLayout () {
  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [nickName, setNickName] = useAtom(STATE.nickName)
  const [isDarkMode, setIsDarkMode] = useAtom(STATE.isDarkMode)
  const [followSystemTheme, setFollowSystemTheme] = useAtom(
    STATE.followSystemTheme
  )

  const hasProcessedInitialUrlRef = useRef(false)
  const rootNavigationState = useRootNavigationState()

  // Load vector icon fonts
  const [fontsLoaded, fontError] = useFonts({
    ...FontAwesome.font,
    ...FontAwesome5.font,
    ...MaterialIcons.font,
    ...Ionicons.font,
    ...AntDesign.font
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
            linkData.friendshipUuid
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
            linkData.friendName
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
                contactName: linkData.friendName
              })

              Toast.show({
                text1: 'Friend name updated!',
                text2: `Updated to "${linkData.friendName}"`,
                type: 'success',
                topOffset: 100
              })
            } catch (error) {
              console.error('Error updating friend name:', error)
              Toast.show({
                text1: 'Update failed',
                text2: 'Could not update friend name',
                type: 'error',
                topOffset: 100
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
        visibilityTime: 4000
      })
    }
  }, [])

  // Handle deep link - simplified to always navigate immediately
  const handleDeepLink = useCallback(
    (url: string) => {
      console.log('Deep link received:', url)
      const linkData = parseDeepLink(url)

      if (!linkData) {
        console.log('Invalid deep link format')
        return
      }

      // Always navigate immediately - both cold and warm starts are handled the same
      console.log('Navigating to deep link:', linkData.type)
      navigateToDeepLink(linkData)
    },
    [navigateToDeepLink]
  )

  // Initialize app state
  useEffect(() => {
    let isCancelled = false

    const getResolvedValue = <T,>(
      result: PromiseSettledResult<T>,
      defaultValue: T
    ): T => {
      return result.status === 'fulfilled' ? result.value ?? defaultValue : defaultValue
    }

    const initialize = async () => {
      try {
        console.log('🚀 Initializing app...')
        const startTime = Date.now()

        // Load all preferences in parallel
        const [
          uuidResult,
          nickNameResult,
          themePreferenceResult,
          followSystemResult
        ] = await Promise.allSettled([
          SecretReducer.getUUID(),
          SecretReducer.getStoredNickName(),
          loadThemePreference(),
          loadFollowSystemPreference()
        ])

        if (isCancelled) return

        // Set state with resolved values
        setUuid(getResolvedValue(uuidResult, ''))
        setNickName(getResolvedValue(nickNameResult, ''))

        const followSystem = !!getResolvedValue(followSystemResult, false)
        setFollowSystemTheme(followSystem)

        const themePreference = !!getResolvedValue(themePreferenceResult, false)
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
      // Set initial theme based on system
      setIsDarkMode(getSystemTheme())

      // Subscribe to system theme changes
      const subscription = subscribeToSystemTheme(setIsDarkMode)

      // Clean up subscription on unmount or when followSystemTheme becomes false
      return () => {
        if (subscription && typeof subscription.remove === 'function') {
          subscription.remove()
        }
      }
    }

    // Explicitly return undefined when not following system theme
    return undefined
  }, [followSystemTheme, setIsDarkMode])

  // Handle deep linking setup - wait for navigation to be ready
  useEffect(() => {
    // Only proceed if navigation is ready
    if (!rootNavigationState?.key) {
      console.log('Navigation not ready yet, waiting...')
      return
    }

    console.log('Navigation is ready')

    // Get initial URL only once (cold start)
    if (!hasProcessedInitialUrlRef.current) {
      hasProcessedInitialUrlRef.current = true

      Linking.getInitialURL()
        .then((url) => {
          if (url) {
            console.log('Initial URL detected (cold start):', url)
            // Small delay to ensure router is fully ready
            setTimeout(() => {
              handleDeepLink(url)
            }, 100)
          }
        })
        .catch(console.error)
    }

    // Listen for URL changes while app is running (warm start)
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('URL event received (warm start):', event.url)
      handleDeepLink(event.url)
    })

    return () => subscription?.remove()
  }, [handleDeepLink, rootNavigationState?.key])

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor='transparent'
        translucent={false}
      />
      <ActiveWaveIndicator />
      <Stack
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name='(drawer)' options={{ headerShown: false }} />
      </Stack>
      <Toast />
    </SafeAreaProvider>
  )
}
