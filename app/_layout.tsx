import 'react-native-get-random-values' // Must be imported before uuid

import NetInfo from '@react-native-community/netinfo'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Stack } from 'expo-router'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { Platform, StatusBar } from 'react-native'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Toast, { BaseToast } from 'react-native-toast-message'

import useLocationProvider from '../src/hooks/useLocationProvider'
import * as SecretReducer from '../src/screens/Secret/reducer'
import * as STATE from '../src/state'
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

  // Deep links (cold AND warm) are handled natively by expo-router via the
  // trampoline routes under app/ (photos/[photoId], friends/[friendshipUuid],
  // wave/join/[waveUuid], wave/invite/[inviteToken]). Each trampoline resets
  // the stack to home and pushes the target on top, so back always returns
  // to the landing screen. No manual Linking listener is required here —
  // expo-router's internal useLinking already subscribes to URL events.

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
