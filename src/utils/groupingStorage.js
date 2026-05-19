import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEYS = {
  ENABLED: '@grouping:enabled',
  GROUPING_LEVEL: '@grouping:groupingLevel',
  OLD_GROUPING_LEVEL: '@grouping:granularity',
  LAST_TRIGGER_LAT: '@grouping:lastTriggerLat',
  LAST_TRIGGER_LON: '@grouping:lastTriggerLon',
  LAST_TRIGGER_TS: '@grouping:lastTriggerTs'
}

const DEFAULTS = {
  ENABLED: 'true',
  GROUPING_LEVEL: 'CITY'
}

/**
 * Load all grouping settings from AsyncStorage with backward-compatible migration.
 * Migrates old key @grouping:granularity → new key @grouping:groupingLevel.
 * @returns {Promise<{enabled: boolean, groupingLevel: string, lastTriggerLat: number|null, lastTriggerLon: number|null, lastTriggerTs: number|null}>}
 */
export async function loadGroupingSettings () {
  try {
    const result = await AsyncStorage.multiGet([
      STORAGE_KEYS.ENABLED,
      STORAGE_KEYS.GROUPING_LEVEL,
      STORAGE_KEYS.OLD_GROUPING_LEVEL,
      STORAGE_KEYS.LAST_TRIGGER_LAT,
      STORAGE_KEYS.LAST_TRIGGER_LON,
      STORAGE_KEYS.LAST_TRIGGER_TS
    ])

    const enabled = result.find(r => r[0] === STORAGE_KEYS.ENABLED)
    const groupingLevel = result.find(r => r[0] === STORAGE_KEYS.GROUPING_LEVEL)
    const oldGroupingLevel = result.find(r => r[0] === STORAGE_KEYS.OLD_GROUPING_LEVEL)
    const lastTriggerLat = result.find(r => r[0] === STORAGE_KEYS.LAST_TRIGGER_LAT)
    const lastTriggerLon = result.find(r => r[0] === STORAGE_KEYS.LAST_TRIGGER_LON)
    const lastTriggerTs = result.find(r => r[0] === STORAGE_KEYS.LAST_TRIGGER_TS)

    // Migration: read from old key if new key not set, then write to new key and delete old
    let level = groupingLevel?.[1]
    if (!level && oldGroupingLevel?.[1]) {
      level = oldGroupingLevel[1]
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.GROUPING_LEVEL, level)
        await AsyncStorage.removeItem(STORAGE_KEYS.OLD_GROUPING_LEVEL)
      } catch (migrateError) {
        console.warn('[groupingStorage] Migration failed:', migrateError)
      }
    }

    return {
      enabled: enabled?.[1] !== 'false',
      groupingLevel: level || DEFAULTS.GROUPING_LEVEL,
      lastTriggerLat: lastTriggerLat?.[1] ? parseFloat(lastTriggerLat[1]) : null,
      lastTriggerLon: lastTriggerLon?.[1] ? parseFloat(lastTriggerLon[1]) : null,
      lastTriggerTs: lastTriggerTs?.[1] ? parseInt(lastTriggerTs[1], 10) : null
    }
  } catch (error) {
    console.warn('[groupingStorage] Failed to load settings:', error)
    return {
      enabled: true,
      groupingLevel: 'CITY',
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
 * Save the grouping level preset.
 * @param {'DISTRICT'|'CITY'|'REGION'|'COUNTRY'} groupingLevel
 */
export async function saveGroupingLevel (groupingLevel) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.GROUPING_LEVEL, groupingLevel)
  } catch (error) {
    console.warn('[groupingStorage] Failed to save grouping level:', error)
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
 * Get the grouping threshold in km for drift comparison.
 * @param {'DISTRICT'|'CITY'|'REGION'|'COUNTRY'} groupingLevel
 * @returns {number} Threshold in km
 */
export function getGroupingThreshold (groupingLevel) {
  const thresholds = {
    DISTRICT: 10,
    CITY: 50,
    REGION: 250,
    COUNTRY: 1000
  }
  return thresholds[groupingLevel] || thresholds.CITY
}
