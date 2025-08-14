import * as SecureStore from 'expo-secure-store'

const THEME_KEY = 'USER_THEME_PREFERENCE'

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
