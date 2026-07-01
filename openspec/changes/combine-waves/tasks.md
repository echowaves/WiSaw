## 1. Update GraphQL Mutation

- [x] 1.1 Update `mergeWaves` in `src/screens/Waves/reducer.js` to accept `sourceWaveUuids` array instead of single `sourceWaveUuid` string, and add optional `name`/`description` parameters
- [x] 1.2 Update `MergeWaveModal` caller to pass `[sourceWaveUuid]` as array instead of single string

## 2. WaveCard Selection UI

- [x] 2.1 Add `selectMode` and `selected` props to `WaveCard` component in `src/components/WaveCard/index.js`
- [x] 2.2 Render circular check overlay on wave card when `selected` is true
- [x] 2.3 Disable long-press context menu when `selectMode` is true
- [x] 2.4 Pass `onPress` handler for selection toggle when in `selectMode`

## 3. WavesHub Selection Mode

- [x] 3.1 Add `selectMode` boolean state and `selectedWaveUuids` Set state to `WavesHub` in `src/screens/WavesHub/index.js`
- [x] 3.2 Add "Select" button to header right side (visible in browse mode)
- [x] 3.3 Replace header with "Count: N" text and "Deselect" button when in selection mode
- [x] 3.4 Implement `toggleWaveSelection` function that adds/removes wave UUID from selected set (only for owner waves)
- [x] 3.5 Pass `selectMode`, `selected`, and `onToggleSelection` props to WaveCard components

## 4. Floating Combine Action Bar

- [x] 4.1 Create floating action bar component at bottom of screen, visible only in selection mode
- [x] 4.2 Display "Combine (N)" text showing current selection count
- [x] 4.3 Disable button when selection count is less than 2
- [x] 4.4 Wire button press to trigger combine flow

## 5. Combine Flow

- [x] 5.1 Implement `getTargetWave` helper that selects the wave with most photos from selected waves (tie-break: most recent updatedAt)
- [x] 5.2 Show confirmation Alert with target wave name, number of waves, and total source photo count
- [x] 5.3 On confirm, call `mergeWaves` with target wave UUID and source wave UUIDs array (all selected except target)
- [x] 5.4 On success, call `handleRefresh()` to reload waves list and exit selection mode
- [x] 5.5 On failure, show error toast and preserve selection state

## 6. Exit Selection Mode

- [x] 6.1 Clear `selectedWaveUuids` and set `selectMode` to false when user taps "Deselect"
- [x] 6.2 Clear selection state after successful combine operation
- [x] 6.3 Preserve selection state if user cancels combine confirmation
