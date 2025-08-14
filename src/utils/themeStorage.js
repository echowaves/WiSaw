import * as SecureStore from 'expo-secure-store'
import { Appearance } from 'react-native'

const THEME_KEY = 'USER_THEME_PREFERENCE'
const FOLLOW_SYSTEM_KEY = 'FOLLOW_SYSTEM_THEME'

export const saveThemePreference = async (isDark) => {
  try {
    await SecureStore.setItemAsync(THEME_KEY, isDark ? 'dark' : 'light')
  } catch (error) {
    console.error('Failed to save theme preference:', error)
  }
}

export const loadThemePreference = async () => {
  try {
    const theme = await SecureStore.getItemAsync(THEME_KEY)
    return theme === 'dark'
  } catch (error) {
    console.error('Failed to load theme preference:', error)
    return false // Default to light mode
  }
}

export const saveFollowSystemPreference = async (followSystem) => {
  try {
    await SecureStore.setItemAsync(
      FOLLOW_SYSTEM_KEY,
      followSystem ? 'true' : 'false',
    )
  } catch (error) {
    console.error('Failed to save follow system preference:', error)
  }
}

export const loadFollowSystemPreference = async () => {
  try {
    const followSystem = await SecureStore.getItemAsync(FOLLOW_SYSTEM_KEY)
    return followSystem === 'true'
  } catch (error) {
    console.error('Failed to load follow system preference:', error)
    return false // Default to manual control
  }
}

export const getSystemTheme = () => {
  return Appearance.getColorScheme() === 'dark'
}

export const subscribeToSystemTheme = (callback) => {
  return Appearance.addChangeListener(({ colorScheme }) => {
    callback(colorScheme === 'dark')
  })
}
