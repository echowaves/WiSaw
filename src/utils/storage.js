import AsyncStorage from '@react-native-async-storage/async-storage'

// Compatibility wrapper matching the expo-storage API
export const Storage = {
  async getItem ({ key }) {
    return AsyncStorage.getItem(key)
  },

  async setItem ({ key, value }) {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
    return AsyncStorage.setItem(key, stringValue)
  },

  async removeItem ({ key }) {
    return AsyncStorage.removeItem(key)
  }
}
