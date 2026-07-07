import 'react-native-get-random-values' // Must be imported before uuid

import {
  AntDesign,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialIcons
} from '@expo/vector-icons'
import NetInfo from '@react-native-community/netinfo'
import { useFonts } from 'expo-font'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as Linking from 'expo-linking'
import { router, Stack, useRootNavigationState } from 'expo-router'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform, StatusBar } from 'react-native'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Toast, { BaseToast } from 'react-native-toast-message'

import useLocationProvider from '../src/hooks/useLocationProvider'
import * as SecretReducer from '../src/screens/Secret/reducer'
import * as STATE from '../src/state'
import { parseDeepLink } from '../src/utils/linkingHelper'
import ErrorDetailModal from '../src/components/ErrorDetailModal'
import {
  getSystemTheme,
  loadFollowSystemPreference,
  loadThemePreference,
  subscribeToSystemTheme
} from '../src/utils/themeStorage'
// waveSortBy, waveSortDirection, waveFeedSortBy, waveFeedSortDirection, friendFeedSortBy, friendFeedSortDirection atoms removed — sort is fixed to createdAt desc
import { hydrateGroupingAtom, groupingAtom } from '../src/utils/groupingAtom'
import { setAtomSetter, getCurrentOnPress } from '../src/utils/showErrorToast'
import { errorContextAtom } from '../src/atoms/errorAtom'
import { gql } from '@apollo/client'
import { gqlClient } from '../src/consts'
import appConfig from '../app.config.js'
import { compareSemver } from '../src/utils/semver'
import ForceUpdateModal from '../src/components/ForceUpdateModal'

// Custom error toast component with 2-line message and tap support
const ErrorToastWithTap = (props: any) => (
  <BaseToast
     {...props}
    text2NumberOfLines={2}
    onPress={() => {
      const cb = getCurrentOnPress()
      if (cb) cb()
      }}
    />
)


export default function RootLayout (): JSX.Element {
  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [nickName, setNickName] = useAtom(STATE.nickName)
  const [isDarkMode, setIsDarkMode] = useAtom(STATE.isDarkMode)
  const [followSystemTheme, setFollowSystemTheme] = useAtom(
    STATE.followSystemTheme
   )
  const setGrouping = useSetAtom(groupingAtom)
  const setAtomSet = useSetAtom(errorContextAtom)
  const netAvailable = useAtomValue(STATE.netAvailable)
  useEffect(() => {
    setAtomSetter(setAtomSet)
  }, [setAtomSet])

  // Force update check state
  const [showForceUpdate, setShowForceUpdate] = useState(false)
  const [forceUpdateTrigger, setForceUpdateTrigger] = useState<'build' | 'version' | 'both'>('build')
  const [forceUpdateMessage, setForceUpdateMessage] = useState<string | undefined>(undefined)

  // Check device build/version against backend AppConfig
  useEffect(() => {
    const checkBuildVersion = async () => {
      try {
        // Skip if no network
        if (!netAvailable) {
          return
        }

        // Fetch AppConfig from backend
        const response = await gqlClient.query({
          query: gql`
            query GetAppConfig {
              appConfig {
                minAppBuild
                minAppVersion
                message
              }
            }
          `,
          fetchPolicy: 'network-only'
        })

        const appConfigData = response.data?.appConfig
        if (!appConfigData) {
          return
        }

        const minBuild = appConfigData.minAppBuild ?? 0
        const minVersion = appConfigData.minAppVersion ?? '0.0.0'

        // Read device build number (platform-appropriate)
        const deviceBuild = Platform.select({
          ios: String(appConfig.expo.ios.buildNumber),
          android: String(appConfig.expo.android.versionCode),
          default: String(appConfig.expo.ios.buildNumber)
        }) ?? '0'

        // Read device version
        const deviceVersion = appConfig.expo.version ?? '0.0.0'

        // Compare thresholds
        const buildBelow = parseInt(deviceBuild, 10) < minBuild
        const versionBelow = compareSemver(deviceVersion, minVersion) < 0

        if (!buildBelow && !versionBelow) {
          return
        }

        // Determine which threshold triggered
        let trigger: 'build' | 'version' | 'both'
        if (buildBelow && versionBelow) {
          trigger = 'both'
        } else if (buildBelow) {
          trigger = 'build'
        } else {
          trigger = 'version'
        }

        // Use backend message if provided, else fallback
        const backendMessage = appConfigData.message
        if (backendMessage && backendMessage.trim().length > 0) {
          setForceUpdateMessage(backendMessage)
        }

        setForceUpdateTrigger(trigger)
        setShowForceUpdate(true)
      } catch (error) {
        // GraphQL error — skip check gracefully
      }
    }

    checkBuildVersion()
  }, [])

  const hasProcessedInitialUrlRef = useRef(false)
  const rootNavigationState = useRootNavigationState()

  // Initialize global location provider (permission, watcher, atom)
  useLocationProvider()

  // Global network state — single listener for entire app
  const setNetAvailable = useSetAtom(STATE.netAvailable)
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state) {
        setNetAvailable(state.isConnected && state.isInternetReachable !== false)
      }
    })
    return () => unsubscribe()
  }, [setNetAvailable])

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

        case 'wave-join':
          console.log('Navigating to wave join:', linkData.waveUuid)
          router.replace('/')
          setTimeout(() => {
            router.push({ pathname: '/waves/join', params: { waveUuid: linkData.waveUuid } })
          }, 100)
          break

        case 'wave-invite':
          console.log('Navigating to wave invite join:', linkData.inviteToken)
          router.replace('/')
          setTimeout(() => {
            router.push({ pathname: '/waves/join', params: { inviteToken: linkData.inviteToken } })
          }, 100)
          break

        default:
          console.log('Unknown link type, navigating to home')
          router.replace('/')
      }
    } catch (error) {
      console.error('Error during navigation:', error)
      router.replace('/')
      showErrorToast({
        title: 'Navigation Error',
        message: 'Unable to navigate to requested content',
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
          followSystemResult,
          groupingResult
         ] = await Promise.allSettled([
          SecretReducer.getUUID(),
          SecretReducer.getStoredNickName(),
          loadThemePreference(),
          loadFollowSystemPreference(),
          hydrateGroupingAtom()
         ])

        if (isCancelled) return

        // Set state with resolved values
        setUuid(getResolvedValue(uuidResult, ''))
        setNickName(getResolvedValue(nickNameResult, ''))

        const followSystem = !!getResolvedValue(followSystemResult, false)
        setFollowSystemTheme(followSystem)

        const themePreference = !!getResolvedValue(themePreferenceResult, false)
        setIsDarkMode(followSystem ? getSystemTheme() : themePreference)

        // waveSortBy, waveSortDirection, waveFeedSortBy, waveFeedSortDirection, friendFeedSortBy, friendFeedSortDirection atoms removed — sort is fixed to createdAt desc

        const groupingSettings = getResolvedValue(groupingResult, null)
        if (groupingSettings) {
          setGrouping(groupingSettings)
          console.log('✅ Grouping settings hydrated:', groupingSettings.groupingLevel)
         }

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor='transparent'
          translucent={false}
        />
        <KeyboardProvider statusBarTranslucent>
          <Stack
            screenOptions={{
              headerShown: false
            }}
          >
            <Stack.Screen name='(drawer)' options={{ headerShown: false }} />
            <Stack.Screen name='pinch' options={{ presentation: 'fullScreenModal', gestureEnabled: false, headerShown: false }} />
            <Stack.Screen name='modal-input' options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
        </KeyboardProvider>
         <Toast config={{ error: ErrorToastWithTap }} />
        <ErrorDetailModal />
        {showForceUpdate && (
          <ForceUpdateModal
            message={forceUpdateMessage}
            triggerType={forceUpdateTrigger}
          />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
