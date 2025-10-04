import * as SecureStore from 'expo-secure-store'
import { Appearance } from 'react-native'
import Toast from 'react-native-toast-message'

const THEME_KEY = 'USER_THEME_PREFERENCE'
const FOLLOW_SYSTEM_KEY = 'FOLLOW_SYSTEM_THEME'

export const saveThemePreference = async (isDark) => {
  try {
    await SecureStore.setItemAsync(THEME_KEY, isDark ? 'dark' : 'light')
  } catch (error) {
    console.error('Failed to save theme preference:', error)
    Toast.show({
      text1: 'Theme Save Error',
      text2: 'Unable to save theme preference',
      type: 'error',
      visibilityTime: 3000
    })
  }
}

export const loadThemePreference = async () => {
  try {
    // Add timeout protection
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Theme storage timeout')), 3000)
    })

    const getItemPromise = SecureStore.getItemAsync(THEME_KEY)
    const theme = await Promise.race([getItemPromise, timeoutPromise])
    return theme === 'dark'
  } catch (error) {
    console.error('Failed to load theme preference:', error)
    Toast.show({
      text1: 'Theme Loading Error',
      text2: 'Using default light theme',
      type: 'error',
      visibilityTime: 3000
    })
    return false // Default to light mode
  }
}

export const saveFollowSystemPreference = async (followSystem) => {
  try {
    await SecureStore.setItemAsync(FOLLOW_SYSTEM_KEY, followSystem ? 'true' : 'false')
  } catch (error) {
    console.error('Failed to save follow system preference:', error)
    Toast.show({
      text1: 'Settings Save Error',
      text2: 'Unable to save system theme preference',
      type: 'error',
      visibilityTime: 3000
    })
  }
}

export const loadFollowSystemPreference = async () => {
  try {
    // Add timeout protection
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Follow system storage timeout')), 3000)
    })

    const getItemPromise = SecureStore.getItemAsync(FOLLOW_SYSTEM_KEY)
    const followSystem = await Promise.race([getItemPromise, timeoutPromise])
    return followSystem === 'true'
  } catch (error) {
    console.error('Failed to load follow system preference:', error)
    Toast.show({
      text1: 'Theme Settings Error',
      text2: 'Unable to load system theme preference',
      type: 'error',
      visibilityTime: 3000
    })
    return false // Default to manual control
  }
}

export const getSystemTheme = () => {
  try {
    const colorScheme = Appearance.getColorScheme()
    console.log('📱 System color scheme:', colorScheme)
    return colorScheme === 'dark'
  } catch (error) {
    console.error('Failed to get system theme:', error)
    return false // Default to light mode
  }
}

export const subscribeToSystemTheme = (callback) => {
  try {
    console.log('🔔 Subscribing to system theme changes')
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      console.log('📱 System theme changed to:', colorScheme)
      callback(colorScheme === 'dark')
    })
    return subscription
  } catch (error) {
    console.error('Failed to subscribe to system theme:', error)
    Toast.show({
      text1: 'Theme Sync Error',
      text2: 'Unable to sync with system theme',
      type: 'error',
      visibilityTime: 3000
    })
    return null
  }
}
