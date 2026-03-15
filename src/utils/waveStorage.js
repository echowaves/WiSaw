/* global console, setTimeout */
import * as SecureStore from 'expo-secure-store'
import Toast from 'react-native-toast-message'

const ACTIVE_WAVE_KEY = 'ACTIVE_WAVE'
const UPLOAD_TARGET_WAVE_KEY = 'UPLOAD_TARGET_WAVE'

export const saveActiveWave = async (wave) => {
  try {
    if (wave) {
      await SecureStore.setItemAsync(ACTIVE_WAVE_KEY, JSON.stringify(wave))
    } else {
      await SecureStore.deleteItemAsync(ACTIVE_WAVE_KEY)
    }
  } catch (error) {
    console.error('Failed to save active wave:', error)
    Toast.show({
      text1: 'Wave Save Error',
      text2: 'Unable to save wave selection',
      type: 'error',
      visibilityTime: 3000
    })
  }
}

export const loadActiveWave = async () => {
  try {
    // Add timeout protection
    const timeoutPromise = new Promise((_resolve, reject) => {
      setTimeout(() => reject(new Error('Wave storage timeout')), 3000)
    })

    const getItemPromise = SecureStore.getItemAsync(ACTIVE_WAVE_KEY)
    const waveJson = await Promise.race([getItemPromise, timeoutPromise])

    if (waveJson) {
      return JSON.parse(waveJson)
    }
    return null
  } catch (error) {
    console.error('Failed to load active wave:', error)
    Toast.show({
      text1: 'Wave Loading Error',
      text2: 'Unable to restore wave selection',
      type: 'error',
      visibilityTime: 3000
    })
    return null
  }
}

export const clearActiveWave = async () => {
  try {
    await SecureStore.deleteItemAsync(ACTIVE_WAVE_KEY)
  } catch (error) {
    console.error('Failed to clear active wave:', error)
  }
}

export const saveUploadTargetWave = async (wave) => {
  try {
    if (wave) {
      await SecureStore.setItemAsync(UPLOAD_TARGET_WAVE_KEY, JSON.stringify(wave))
    } else {
      await SecureStore.deleteItemAsync(UPLOAD_TARGET_WAVE_KEY)
    }
  } catch (error) {
    console.error('Failed to save upload target wave:', error)
    Toast.show({
      text1: 'Wave Save Error',
      text2: 'Unable to save upload target',
      type: 'error',
      visibilityTime: 3000
    })
  }
}

export const loadUploadTargetWave = async () => {
  try {
    const timeoutPromise = new Promise((_resolve, reject) => {
      setTimeout(() => reject(new Error('Wave storage timeout')), 3000)
    })

    const getItemPromise = SecureStore.getItemAsync(UPLOAD_TARGET_WAVE_KEY)
    const waveJson = await Promise.race([getItemPromise, timeoutPromise])

    if (waveJson) {
      return JSON.parse(waveJson)
    }

    // Migration: if no uploadTargetWave but activeWave exists, migrate it
    const legacyJson = await Promise.race([
      SecureStore.getItemAsync(ACTIVE_WAVE_KEY),
      new Promise((_resolve, reject) => {
        setTimeout(() => reject(new Error('Legacy wave storage timeout')), 3000)
      })
    ])

    if (legacyJson) {
      const legacyWave = JSON.parse(legacyJson)
      await SecureStore.setItemAsync(UPLOAD_TARGET_WAVE_KEY, legacyJson)
      await SecureStore.deleteItemAsync(ACTIVE_WAVE_KEY)
      return legacyWave
    }

    return null
  } catch (error) {
    console.error('Failed to load upload target wave:', error)
    Toast.show({
      text1: 'Wave Loading Error',
      text2: 'Unable to restore upload target',
      type: 'error',
      visibilityTime: 3000
    })
    return null
  }
}

export const clearUploadTargetWave = async () => {
  try {
    await SecureStore.deleteItemAsync(UPLOAD_TARGET_WAVE_KEY)
  } catch (error) {
    console.error('Failed to clear upload target wave:', error)
  }
}
