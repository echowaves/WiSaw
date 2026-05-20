import { atom } from 'jotai'
import { loadGroupingSettings, saveGroupingEnabled, saveGroupingLevel, saveLastTriggerLocation, saveLastTriggerTimestamp } from './groupingStorage'

/**
 * Grouping settings atom — initialized with defaults, hydrated asynchronously.
 * Shape: { enabled, groupingLevel, lastTriggerLat, lastTriggerLon, lastTriggerTs }
 */
// Ref to store the Jotai set function from a React component
let _setGroupingRef = null

/**
 * Call this from a React component to register the Jotai setter.
 * Usage: const setGrouping = useSetAtom(groupingAtom); useEffect(() => { registerGroupingSetter(setGrouping) }, [])
 */
export function registerGroupingSetter (setGrouping) {
  _setGroupingRef = setGrouping
}

let _groupingState = {
  enabled: true,
  groupingLevel: 'CITY',
  lastTriggerLat: null,
  lastTriggerLon: null,
  lastTriggerTs: null
}

export const groupingAtom = atom(_groupingState)

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
  _groupingState = { ..._groupingState, enabled }
  if (_setGroupingRef) {
    _setGroupingRef({ enabled })
  }
}

/**
  * Convenience: save the grouping level preset.
  * @param {'DISTRICT'|'CITY'|'REGION'|'COUNTRY'} groupingLevel
  */
export async function setGroupingLevel (groupingLevel) {
  await saveGroupingLevel(groupingLevel)
  _groupingState = { ..._groupingState, groupingLevel }
  if (_setGroupingRef) {
    _setGroupingRef({ groupingLevel })
  }
}

/**
 * Convenience: save the last trigger GPS coordinates.
 * @param {number} lat
 * @param {number} lon
 */
export async function setLastTriggerLocation (lat, lon) {
  await saveLastTriggerLocation(lat, lon)
  await saveLastTriggerTimestamp(Date.now())
  _groupingState = { ..._groupingState, lastTriggerLat: lat, lastTriggerLon: lon, lastTriggerTs: Date.now() }
  if (_setGroupingRef) {
    _setGroupingRef({ lastTriggerLat: lat, lastTriggerLon: lon, lastTriggerTs: Date.now() })
  }
}
