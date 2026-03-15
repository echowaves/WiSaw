## 1. State & Storage Foundation

- [ ] 1.1 Create `uploadTargetWave` atom in `src/state.js` (same shape as `activeWave`: `{ waveUuid, name, createdBy, createdAt } | null`)
- [ ] 1.2 Update `src/utils/waveStorage.js`: add `saveUploadTargetWave`, `loadUploadTargetWave`, `clearUploadTargetWave` functions using SecureStore
- [ ] 1.3 Add migration logic in `waveStorage.js`: on `loadUploadTargetWave`, if no value exists but `activeWave` key has a value, migrate it and clear the old key
- [ ] 1.4 Update app startup to call `loadUploadTargetWave` instead of `loadActiveWave` and initialize the `uploadTargetWave` atom

## 2. GraphQL Reducer Updates

- [ ] 2.1 Update `listWaves` query in `src/screens/Waves/reducer.js` to include `photos` field in the response
- [ ] 2.2 Add `removePhotoFromWave` mutation to `src/screens/Waves/reducer.js` (waveUuid, photoId params, returns Boolean)
- [ ] 2.3 Extract `addPhotoToWave` mutation from `photoUploadService.js` into `src/screens/Waves/reducer.js` as a reusable exported function

## 3. Wave Header Icon

- [ ] 3.1 Create `src/components/WaveHeaderIcon/index.js` component: renders FontAwesome5 `water` icon with configurable color and optional badge dot
- [ ] 3.2 Wire `WaveHeaderIcon` to read `uploadTargetWave` atom: gray when null, MAIN_COLOR + dot when set
- [ ] 3.3 Add long-press handler to `WaveHeaderIcon`: shows toast with upload target wave name or "No upload target set"
- [ ] 3.4 Integrate `WaveHeaderIcon` into the upper-right of `renderCustomHeader()` in `src/screens/PhotosList/index.js`, with `onPress` navigating to waves-hub route

## 4. Waves Hub Screen

- [ ] 4.1 Create Expo Router route file `app/(drawer)/waves-hub.tsx` with header configuration (title "Waves", back button, Auto-Group and + buttons in headerRight)
- [ ] 4.2 Create `src/screens/WavesHub/index.js`: main hub component with FlatList, 2-column numColumns layout, upload target bar, search input, and pull-to-refresh
- [ ] 4.3 Create `src/screens/WavesHub/reducer.js`: re-export wave queries/mutations from Waves reducer (or import directly)
- [ ] 4.4 Create `src/components/WaveCard/index.js`: visual card component with 4-photo thumbnail collage grid, wave name, photo count, and placeholder for empty waves
- [ ] 4.5 Implement upload target bar at top of WavesHub: shows current `uploadTargetWave` name with clear button, or "No upload target set"
- [ ] 4.6 Implement client-side search filtering: TextInput that filters waves array by name (case-insensitive `includes`)
- [ ] 4.7 Implement wave card long-press context menu: action sheet with Set as Upload Target, Rename, Edit Description, Delete Wave (owner-only options)
- [ ] 4.8 Implement wave creation modal (reuse pattern from existing Waves screen): name + description fields, create button, prepend to grid on success
- [ ] 4.9 Implement auto-group button with confirmation dialog and looping mutation (reuse logic from existing Waves screen)
- [ ] 4.10 Implement pagination: `onEndReached` loads next page via `listWaves`

## 5. Wave Detail Screen

- [ ] 5.1 Create Expo Router route file `app/(drawer)/wave-detail.tsx` with route params (`waveUuid`, `waveName`) and header configuration (wave name title, ⋮ menu button)
- [ ] 5.2 Create `src/screens/WaveDetail/index.js`: masonry photo grid using `ExpoMasonryLayout` + `ExpandableThumb`, loading wave photos via `feedForWatcher` with `waveUuid`
- [ ] 5.3 Create `src/screens/WaveDetail/reducer.js`: wave photo fetching (reuse `feedForWatcher` with wave query), `removePhotoFromWave` call
- [ ] 5.4 Implement action buttons row: "Set as Upload Target" and "Add Photos" buttons below header metadata
- [ ] 5.5 Implement ⋮ header menu: action sheet with Rename, Edit Description, Share Wave, Delete Wave
- [ ] 5.6 Implement rename/edit description modals triggered from ⋮ menu
- [ ] 5.7 Implement photo long-press in Wave Detail: context menu with "Remove from Wave" option calling `removePhotoFromWave` mutation
- [ ] 5.8 Implement pagination for wave photos: `onEndReached` with `feedForWatcher` + `waveUuid`
- [ ] 5.9 Implement empty state when wave has no photos

## 6. Photo Selection Mode

- [ ] 6.1 Add `selectionMode`, `selected`, and `onSelect` props to `src/components/ExpandableThumb/index.js`: when `selectionMode` is true, tap calls `onSelect` instead of `onToggleExpand`, and a checkmark overlay is shown when `selected` is true
- [ ] 6.2 Create Expo Router route file `app/(drawer)/photo-selection.tsx` with route params (`waveUuid`, `waveName`) and header (title "Add to: {waveName}", Done button)
- [ ] 6.3 Create `src/screens/PhotoSelectionMode/index.js`: masonry grid of user's photos (`feedForWatcher` without waveUuid) with `ExpandableThumb` in selection mode, multi-select state tracking
- [ ] 6.4 Implement floating action bar at bottom: shows selected count and "Add" button
- [ ] 6.5 Implement batch `addPhotoToWave` on confirm: iterate selected photo IDs, call mutation for each, show success toast, navigate back to Wave Detail

## 7. Photo Feed Context Menu (Long-Press)

- [ ] 7.1 Add `onLongPress` handler to `ExpandableThumb` in the main PhotosList feed: shows action sheet with "Add to Wave..." and "Start New Wave" options
- [ ] 7.2 Implement wave picker modal/action sheet for "Add to Wave...": scrollable list of user's waves with search, calls `addPhotoToWave` on selection
- [ ] 7.3 Implement "Start New Wave" flow: create wave modal → on success, call `addPhotoToWave` with the new wave UUID and the long-pressed photo ID

## 8. Upload Integration

- [ ] 8.1 Update `src/screens/PhotosList/upload/usePhotoUploader.js` to read from `uploadTargetWave` atom instead of `activeWave`
- [ ] 8.2 Update `src/screens/PhotosList/index.js` camera capture flow to use `uploadTargetWave.waveUuid` instead of `activeWave.waveUuid`
- [ ] 8.3 Verify `photoUploadService.js` addPhotoToWave call works correctly with the new atom

## 9. Navigation & Cleanup

- [ ] 9.1 Update drawer `waves` entry in `app/(drawer)/_layout.tsx` to navigate to the `waves-hub` route instead of the old inline Waves screen
- [ ] 9.2 Remove `ActiveWaveIndicator` component usage from `app/_layout.tsx`
- [ ] 9.3 Remove or deprecate `src/components/ActiveWaveIndicator/index.js`
- [ ] 9.4 Remove the old `src/screens/Waves/index.js` screen (swipe-based wave list) — functionality replaced by WavesHub
- [ ] 9.5 Update `waveAddBus.js` event emitter to work with the new WavesHub create modal
- [ ] 9.6 Deprecate `activeWave` atom in `src/state.js` with a comment pointing to `uploadTargetWave`
