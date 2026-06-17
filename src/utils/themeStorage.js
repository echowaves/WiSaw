import { Storage } from 'expo-storage'
import { Appearance } from 'react-native'
import { showErrorToast, showInfoToast, showSuccessToast } from './showToast'

const THEME_KEY = 'USER_THEME_PREFERENCE'
const FOLLOW_SYSTEM_KEY = 'FOLLOW_SYSTEM_THEME'

export const saveThemePreference = async (isDark) => {
  try {
    await Storage.setItem({ key: THEME_KEY, value: isDark ? 'dark' : 'light' })
  } catch (error) {
    console.error('Failed to save theme preference:', error)
    showErrorToast('Theme Save Error', { text2: 'Unable to save theme preference', visibilityTime: 3000 })
  }
}

export const loadThemePreference = async () => {
  try {
    const theme = await Storage.getItem({ key: THEME_KEY })
    return theme === 'dark'
  } catch (error) {
    console.error('Failed to load theme preference:', error)
    showErrorToast('Theme Loading Error', { text2: 'Using default light theme', visibilityTime: 3000 })
    return false // Default to light mode
  }
}

export const saveFollowSystemPreference = async (followSystem) => {
  try {
    await Storage.setItem({ key: FOLLOW_SYSTEM_KEY, value: followSystem ? 'true' : 'false' })
  } catch (error) {
    console.error('Failed to save follow system preference:', error)
    showErrorToast('Settings Save Error', { text2: 'Unable to save system theme preference', visibilityTime: 3000 })
  }
}

export const loadFollowSystemPreference = async () => {
  try {
    const followSystem = await Storage.getItem({ key: FOLLOW_SYSTEM_KEY })
    return followSystem === 'true'
  } catch (error) {
    console.error('Failed to load follow system preference:', error)
    showErrorToast('Theme Settings Error', { text2: 'Unable to load system theme preference', visibilityTime: 3000 })
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
    showErrorToast('Theme Sync Error', { text2: 'Unable to sync with system theme', visibilityTime: 3000 })
    return null
  }
}
