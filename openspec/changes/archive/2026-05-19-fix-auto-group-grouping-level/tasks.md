## 1. Update `autoGroupPhotos` mutation in reducer

- [x] 1.1 Add `groupingLevel` parameter to `autoGroupPhotos` function signature in `src/screens/Waves/reducer.js`
- [x] 1.2 Update the GraphQL mutation to include `$groupingLevel: String` variable
- [x] 1.3 Add `groupingLevel: $groupingLevel` to the mutation call

## 2. Update `WavesHub` to pass `groupingLevel`

- [x] 2.1 Add `useAtomValue(groupingAtom)` to read `groupingLevel` in `WavesHub/index.js`
- [x] 2.2 Add `groupingLevel` to the `useCallback` dependency array for `handleAutoGroup`
- [x] 2.3 Pass `groupingLevel` to `reducer.autoGroupPhotos({ uuid, groupingLevel })`

## 3. Update `UngroupedPhotosCard` to pass `groupingLevel` via event bus

- [x] 3.1 Extend `emitAutoGroup(count, groupingLevel)` to accept optional `groupingLevel` parameter in `src/events/autoGroupBus.js`
- [x] 3.2 Update `emitAutoGroup` listener signature in `autoGroupBus.js` to accept and forward `groupingLevel`
- [x] 3.3 Read `groupingLevel` from `groupingAtom` in `UngroupedPhotosCard/index.js` and pass to `emitAutoGroup(ungroupedCount, groupingLevel)`

## 4. Update `WavesHub` listener to use `groupingLevel` from event or atom

- [x] 4.1 Update the `subscribeToAutoGroup` callback in `WavesHub/index.js` to accept `groupingLevel` from event
- [x] 4.2 Use `groupingLevel` from event params, falling back to `groupingAtom` if not provided

## 5. Verify all entry points pass `groupingLevel`

- [x] 5.1 Verify manual "Auto-Group" button flow passes `groupingLevel`
- [x] 5.2 Verify auto-trigger on location drift passes `groupingLevel`
- [x] 5.3 Verify `UngroupedPhotosCard` button flow passes `groupingLevel`
