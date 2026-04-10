/* global console */
import { Storage } from 'expo-storage'

const WAVE_SORT_PREFERENCES_KEY = 'WAVE_SORT_PREFERENCES'
const WAVE_FEED_SORT_KEY = 'WAVE_FEED_SORT_PREFERENCES'
const FRIEND_FEED_SORT_KEY = 'FRIEND_FEED_SORT_PREFERENCES'

export const saveWaveSortPreferences = async ({ sortBy, sortDirection }) => {
  try {
    await Storage.setItem({
      key: WAVE_SORT_PREFERENCES_KEY,
      value: JSON.stringify({ sortBy, sortDirection })
    })
  } catch (error) {
    console.error('Failed to save wave sort preferences:', error)
  }
}

export const loadWaveSortPreferences = async () => {
  try {
    const json = await Storage.getItem({ key: WAVE_SORT_PREFERENCES_KEY })

    if (json) {
      return JSON.parse(json)
    }
    return null
  } catch (error) {
    console.error('Failed to load wave sort preferences:', error)
    return null
  }
}

export const saveWaveFeedSortPreferences = async ({ sortBy, sortDirection }) => {
  try {
    await Storage.setItem({
      key: WAVE_FEED_SORT_KEY,
      value: JSON.stringify({ sortBy, sortDirection })
    })
  } catch (error) {
    console.error('Failed to save wave feed sort preferences:', error)
  }
}

export const loadWaveFeedSortPreferences = async () => {
  try {
    const json = await Storage.getItem({ key: WAVE_FEED_SORT_KEY })

    if (json) {
      return JSON.parse(json)
    }
    return null
  } catch (error) {
    console.error('Failed to load wave feed sort preferences:', error)
    return null
  }
}

export const saveFriendFeedSortPreferences = async ({ sortBy, sortDirection }) => {
  try {
    await Storage.setItem({
      key: FRIEND_FEED_SORT_KEY,
      value: JSON.stringify({ sortBy, sortDirection })
    })
  } catch (error) {
    console.error('Failed to save friend feed sort preferences:', error)
  }
}

export const loadFriendFeedSortPreferences = async () => {
  try {
    const json = await Storage.getItem({ key: FRIEND_FEED_SORT_KEY })

    if (json) {
      return JSON.parse(json)
    }
    return null
  } catch (error) {
    console.error('Failed to load friend feed sort preferences:', error)
    return null
  }
}
