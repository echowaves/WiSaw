import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = '@activeWave'

export async function saveActiveWave ({ waveUuid, name }) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ waveUuid, name }))
  } catch (error) {
    console.warn('[activeWaveStorage] Failed to save:', error)
  }
}

export async function loadActiveWave () {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (error) {
    console.warn('[activeWaveStorage] Failed to load:', error)
    return null
  }
}

export async function clearActiveWave () {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('[activeWaveStorage] Failed to clear:', error)
  }
}

export async function hydrateActiveWaveAtom () {
  return loadActiveWave()
}
