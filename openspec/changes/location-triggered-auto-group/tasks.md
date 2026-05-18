## 1. Haversine Utility

- [x] 1.1 Create `src/utils/haversine.js` with `haversine(lat1, lon1, lat2, lon2)` function returning distance in km

## 2. Persistence Layer

- [x] 2.1 Create `src/utils/groupingStorage.js` with functions to load/save `autoGroupEnabled`, `groupingGranularity`, `lastTriggerLat`, `lastTriggerLon` to AsyncStorage
- [x] 2.2 Create `src/utils/groupingAtom.js` with atoms initialized from AsyncStorage (enabled=true, granularity='CITY', lastTriggerLat=null, lastTriggerLon=null)

## 3. Location Drift Detection Hook

- [x] 3.1 Create `src/hooks/useLocationDrift.js` that:
     - Reads current location from `locationAtom`
     - Reads last trigger location from `groupingAtom`
     - Computes haversine distance
     - Returns `{ shouldTrigger: boolean }` based on granularity threshold
- [x] 3.2 Add 5-minute cooldown to prevent rapid successive triggers (store `lastTriggerTimestamp` in `groupingAtom`)

## 4. Auto-Group Trigger Integration in WavesHub

- [x] 4.1 In `src/screens/WavesHub/index.js`, subscribe to `useLocationDrift` hook
- [x] 4.2 On app foreground event (via `AppState`), if `shouldTrigger` AND `autoGroupEnabled` AND `ungroupedCount > 0`, call existing `handleAutoGroup(ungroupedCount)`
- [x] 4.3 After successful auto-group, update `lastTriggerLat`/`lastTriggerLon` in `groupingAtom` using current GPS coords
- [x] 4.4 Ensure progress overlay already exists (verify existing `autoGrouping`/`autoGroupProgress` state in WavesHub covers this; if not, add it)

## 5. Granularity Settings UI

- [x] 5.1 Create `src/screens/GroupingSettings/index.js` (new screen) with:
     - Toggle switch for "Auto-Group" (enabled/disabled)
     - Horizontal segment control for granularity: Near / Medium / Far / World
     - Save to AsyncStorage on change
- [x] 5.2 Add navigation link to GroupingSettings from WavesHub header menu (gear icon → "Grouping Settings")
- [x] 5.3 Wire granularity selection to pass server enum to `autoGroupPhotosIntoWaves` mutation (DISTRICT/CITY/REGION/COUNTRY)

## 6. WaveSettings Integration

- [x] 6.1 Add "Grouping Granularity" section to existing `src/screens/WaveSettings/index.js` OR link out to dedicated GroupingSettings screen
- [x] 6.2 Ensure granularity setting is accessible from a prominent location (WavesHub header menu recommended)

## 7. Edge Cases & Error Handling

- [x] 7.1 Handle AsyncStorage init race: if settings not loaded yet, skip auto-trigger on first foreground
- [x] 7.2 Handle null lastTriggerLocation: if user never triggered auto-group before, skip (no reference point)
- [x] 7.3 Handle server error during auto-group: show toast, do NOT update last trigger location
- [x] 7.4 Handle location permission denied: show info toast, skip auto-trigger

## 8. Testing & Verification

- [x] 8.1 Verify haversine function returns correct distance (test with known coordinates)
- [x] 8.2 Verify granularity presets map to correct server enums
- [x] 8.3 Verify auto-group triggers when location drift > threshold
- [x] 8.4 Verify auto-group does NOT trigger when location drift < threshold
- [x] 8.5 Verify toggle OFF prevents auto-group but manual "Auto Group" still works
- [x] 8.6 Verify progress overlay shows correct counts during auto-group
- [x] 8.7 Verify last trigger location updates only after successful grouping
