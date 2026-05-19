## 1. Update Storage Layer

- [x] 1.1 In `src/utils/groupingStorage.js`: Rename `STORAGE_KEYS.GRANULARITY` → `STORAGE_KEYS.GROUPING_LEVEL`
- [x] 1.2 In `src/utils/groupingStorage.js`: Rename `loadGroupingSettings()` to handle backward-compatible migration (read old key, write to new key, delete old key)
- [x] 1.3 In `src/utils/groupingStorage.js`: Rename `saveGroupingGranularity()` → `saveGroupingLevel()`, update internal references
- [x] 1.4 In `src/utils/groupingStorage.js`: Rename `getGranularityThreshold()` → `getGroupingThreshold()`, update JSDoc

## 2. Update Atoms

- [x] 2.1 In `src/utils/groupingAtom.js`: Rename `_groupingState.granularity` → `_groupingState.groupingLevel`, update default value comment
- [x] 2.2 In `src/utils/groupingAtom.js`: Rename `setGroupingGranularity()` → `setGroupingLevel()`, update parameter name
- [x] 2.3 In `src/utils/groupingAtom.js`: Update import in `GroupingSettings/index.js` (export will be renamed)

## 3. Update Grouping Settings Screen

- [x] 3.1 In `src/screens/GroupingSettings/index.js`: Rename `GRANULARITY_OPTIONS` → `GROUPING_LEVEL_OPTIONS`
- [x] 3.2 In `src/screens/GroupingSettings/index.js`: Rename `granularity` state variable → `groupingLevel`
- [x] 3.3 In `src/screens/GroupingSettings/index.js`: Rename `setGranularity()` → `setGroupingLevel()`
- [x] 3.4 In `src/screens/GroupingSettings/index.js`: Rename `handleGranularityPress()` → `handleGroupingLevelPress()`
- [x] 3.5 In `src/screens/GroupingSettings/index.js`: Update import from `groupingAtom`: `setGroupingGranularity` → `setGroupingLevel`
- [x] 3.6 In `src/screens/GroupingSettings/index.js`: Update UI text: "Granularity" → "Grouping Level"
- [x] 3.7 In `src/screens/GroupingSettings/index.js`: Update option descriptions to field-matching:
     - `DISTRICT`: "Within ~10 km" → "Same district"
     - `CITY`: "Within ~50 km" → "Same city"
     - `REGION`: "Within ~250 km" → "Same region"
     - `COUNTRY`: "Within ~1000 km" → "Same country"
- [x] 3.8 In `src/screens/GroupingSettings/index.js`: Update info card text: "distance threshold" → "field-matching"

## 4. Update Wave Settings Screen

- [x] 4.1 In `src/screens/WaveSettings/index.js`: Rename `grouping.granularity` → `grouping.groupingLevel`
- [x] 4.2 In `src/screens/WaveSettings/index.js`: Update display text: "Granularity:" → "Grouping Level:"

## 5. Update Location Drift Hook

- [x] 5.1 In `src/hooks/useLocationDrift.js`: Rename `grouping.granularity` → `grouping.groupingLevel` (all 3 occurrences)
- [x] 5.2 In `src/hooks/useLocationDrift.js`: Rename `getGranularityThreshold()` → `getGroupingThreshold()`

## 6. Update Tests

- [x] 6.1 In `src/utils/__tests__/groupingStorage.test.js`: Rename `getGranularityThreshold` → `getGroupingThreshold`
- [x] 6.2 In `src/utils/__tests__/groupingStorage.test.js`: Update all test descriptions and function calls

## 7. Verify

- [x] 7.1 Run `npm test` to verify tests pass
- [x] 7.2 Verify Grouping Settings screen displays correctly with new text
- [x] 7.3 Verify existing user's grouping level setting persists after app update (migration works)
- [x] 7.4 Verify auto-group still triggers correctly (groupingLevel passed to mutation)
