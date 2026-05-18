import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEYS = {
  ENABLED: '@grouping:enabled',
  GRANULARITY: '@grouping:granularity',
  LAST_TRIGGER_LAT: '@grouping:lastTriggerLat',
  LAST_TRIGGER_LON: '@grouping:lastTriggerLon',
  LAST_TRIGGER_TS: '@grouping:lastTriggerTs'
}

const DEFAULTS = {
  ENABLED: 'true',
  GRANULARITY: 'CITY'
}

/**
 * Load all grouping settings from AsyncStorage.
 * @returns {Promise<{enabled: boolean, granularity: string, lastTriggerLat: number|null, lastTriggerLon: number|null, lastTriggerTs: number|null}>}
 */
export async function loadGroupingSettings () {
  try {
    const result = await AsyncStorage.multiGet([
      STORAGE_KEYS.ENABLED,
      STORAGE_KEYS.GRANULARITY,
      STORAGE_KEYS.LAST_TRIGGER_LAT,
      STORAGE_KEYS.LAST_TRIGGER_LON,
      STORAGE_KEYS.LAST_TRIGGER_TS
    ])

    const enabled = result.find(r => r[0] === STORAGE_KEYS.ENABLED)
    const granularity = result.find(r => r[0] === STORAGE_KEYS.GRANULARITY)
    const lastTriggerLat = result.find(r => r[0] === STORAGE_KEYS.LAST_TRIGGER_LAT)
    const lastTriggerLon = result.find(r => r[0] === STORAGE_KEYS.LAST_TRIGGER_LON)
    const lastTriggerTs = result.find(r => r[0] === STORAGE_KEYS.LAST_TRIGGER_TS)

    return {
      enabled: enabled?.[1] !== 'false',
      granularity: granularity?.[1] || DEFAULTS.GRANULARITY,
      lastTriggerLat: lastTriggerLat?.[1] ? parseFloat(lastTriggerLat[1]) : null,
      lastTriggerLon: lastTriggerLon?.[1] ? parseFloat(lastTriggerLon[1]) : null,
      lastTriggerTs: lastTriggerTs?.[1] ? parseInt(lastTriggerTs[1], 10) : null
    }
  } catch (error) {
    console.warn('[groupingStorage] Failed to load settings:', error)
    return {
      enabled: true,
      granularity: 'CITY',
      lastTriggerLat: null,
      lastTriggerLon: null,
      lastTriggerTs: null
    }
  }
}

/**
 * Save the auto-group enabled toggle.
 * @param {boolean} enabled
 */
export async function saveGroupingEnabled (enabled) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ENABLED, enabled ? 'true' : 'false')
  } catch (error) {
    console.warn('[groupingStorage] Failed to save enabled:', error)
  }
}

/**
 * Save the grouping granularity preset.
 * @param {'DISTRICT'|'CITY'|'REGION'|'COUNTRY'} granularity
 */
export async function saveGroupingGranularity (granularity) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.GRANULARITY, granularity)
  } catch (error) {
    console.warn('[groupingStorage] Failed to save granularity:', error)
  }
}

/**
 * Save the last trigger GPS coordinates.
 * @param {number} lat
 * @param {number} lon
 */
export async function saveLastTriggerLocation (lat, lon) {
  try {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.LAST_TRIGGER_LAT, String(lat)],
      [STORAGE_KEYS.LAST_TRIGGER_LON, String(lon)]
    ])
  } catch (error) {
    console.warn('[groupingStorage] Failed to save last trigger location:', error)
  }
}

/**
 * Save the last trigger timestamp (epoch ms).
 * @param {number} ts
 */
export async function saveLastTriggerTimestamp (ts) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_TRIGGER_TS, String(ts))
  } catch (error) {
    console.warn('[groupingStorage] Failed to save last trigger timestamp:', error)
  }
}

/**
 * Get the granularity threshold in km for drift comparison.
 * @param {'DISTRICT'|'CITY'|'REGION'|'COUNTRY'} granularity
 * @returns {number} Threshold in km
 */
export function getGranularityThreshold (granularity) {
  const thresholds = {
    DISTRICT: 10,
    CITY: 50,
    REGION: 250,
    COUNTRY: 1000
  }
  return thresholds[granularity] || thresholds.CITY
}
