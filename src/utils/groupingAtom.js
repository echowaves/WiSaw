import { atom } from 'jotai'
import { loadGroupingSettings, saveGroupingEnabled, saveGroupingLevel, saveLastTriggerLocation, saveLastTriggerTimestamp } from './groupingStorage'

/**
 * Grouping settings atom — initialized with defaults, hydrated asynchronously.
 * Shape: { enabled, groupingLevel, lastTriggerLat, lastTriggerLon, lastTriggerTs }
 */
let _groupingState = {
  enabled: true,
  groupingLevel: 'CITY',
  lastTriggerLat: null,
  lastTriggerLon: null,
  lastTriggerTs: null
}

export const groupingAtom = atom(_groupingState)

/**
 * Writable atom that updates grouping settings.
 * Usage: const update = useSetAtom(updateGroupingAtom)
 *        await update({ enabled: false })
 */
export const updateGroupingAtom = atom(
  null,
  async (get, set, updates) => {
    const next = { ...get(groupingAtom), ...updates }
    _groupingState = next
    set(groupingAtom, next)
    return next
   }
)

/**
 * Hydrate the grouping atom from AsyncStorage.
 * Call this once at app startup (e.g., in _app.tsx).
 * @returns {Promise<Object>} Hydrated settings
 */
export async function hydrateGroupingAtom () {
  const settings = await loadGroupingSettings()
  _groupingState = settings
  return settings
}

/**
 * Convenience: save the auto-group enabled toggle.
 * @param {boolean} enabled
 */
export async function setGroupingEnabled (enabled) {
  await saveGroupingEnabled(enabled)
  _groupingState.enabled = enabled
}

/**
 * Convenience: save the grouping level preset.
 * @param {'DISTRICT'|'CITY'|'REGION'|'COUNTRY'} groupingLevel
 */
export async function setGroupingLevel (groupingLevel) {
  await saveGroupingLevel(groupingLevel)
  _groupingState.groupingLevel = groupingLevel
}

/**
 * Convenience: save the last trigger GPS coordinates.
 * @param {number} lat
 * @param {number} lon
 */
export async function setLastTriggerLocation (lat, lon) {
  await saveLastTriggerLocation(lat, lon)
  await saveLastTriggerTimestamp(Date.now())
  _groupingState.lastTriggerLat = lat
  _groupingState.lastTriggerLon = lon
  _groupingState.lastTriggerTs = Date.now()
}
