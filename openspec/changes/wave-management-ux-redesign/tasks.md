## 1. State & Storage Foundation

- [x] 1.1 Create `uploadTargetWave` atom in `src/state.js` (same shape as `activeWave`: `{ waveUuid, name, createdBy, createdAt } | null`)
- [x] 1.2 Update `src/utils/waveStorage.js`: add `saveUploadTargetWave`, `loadUploadTargetWave`, `clearUploadTargetWave` functions using SecureStore
- [x] 1.3 Add migration logic in `waveStorage.js`: on `loadUploadTargetWave`, if no value exists but `activeWave` key has a value, migrate it and clear the old key
- [x] 1.4 Update app startup to call `loadUploadTargetWave` instead of `loadActiveWave` and initialize the `uploadTargetWave` atom

## 2. GraphQL Reducer Updates

- [x] 2.1 Update `listWaves` query in `src/screens/Waves/reducer.js` to include `photos` field in the response
- [x] 2.2 Add `removePhotoFromWave` mutation to `src/screens/Waves/reducer.js` (waveUuid, photoId params, returns Boolean)
- [x] 2.3 Extract `addPhotoToWave` mutation from `photoUploadService.js` into `src/screens/Waves/reducer.js` as a reusable exported function

## 3. Wave Header Icon

- [x] 3.1 Create `src/components/WaveHeaderIcon/index.js` component: renders FontAwesome5 `water` icon with configurable color and optional badge dot
- [x] 3.2 Wire `WaveHeaderIcon` to read `uploadTargetWave` atom: gray when null, MAIN_COLOR + dot when set
- [x] 3.3 Add long-press handler to `WaveHeaderIcon`: shows toast with upload target wave name or "No upload target set"
- [x] 3.4 Integrate `WaveHeaderIcon` into the upper-right of `renderCustomHeader()` in `src/screens/PhotosList/index.js`, with `onPress` navigating to waves-hub route

## 4. Waves Hub Screen

- [x] 4.1 Create Expo Router route file `app/(drawer)/waves-hub.tsx` with header configuration (title "Waves", back button, Auto-Group and + buttons in headerRight)
- [x] 4.2 Create `src/screens/WavesHub/index.js`: main hub component with FlatList, 2-column numColumns layout, upload target bar, search input, and pull-to-refresh
- [x] 4.3 Create `src/screens/WavesHub/reducer.js`: re-export wave queries/mutations from Waves reducer (or import directly)
- [x] 4.4 Create `src/components/WaveCard/index.js`: visual card component with 4-photo thumbnail collage grid, wave name, photo count, and placeholder for empty waves
- [x] 4.5 Implement upload target bar at top of WavesHub: shows current `uploadTargetWave` name with clear button, or "No upload target set"
- [x] 4.6 Implement client-side search filtering: TextInput that filters waves array by name (case-insensitive `includes`)
- [x] 4.7 Implement wave card long-press context menu: action sheet with Set as Upload Target, Rename, Edit Description, Delete Wave (owner-only options)
- [x] 4.8 Implement wave creation modal (reuse pattern from existing Waves screen): name + description fields, create button, prepend to grid on success
- [x] 4.9 Implement auto-group button with confirmation dialog and looping mutation (reuse logic from existing Waves screen)
- [x] 4.10 Implement pagination: `onEndReached` loads next page via `listWaves`

## 5. Wave Detail Screen

- [x] 5.1 Create Expo Router route file `app/(drawer)/wave-detail.tsx` with route params (`waveUuid`, `waveName`) and header configuration (wave name title, ⋮ menu button)
- [x] 5.2 Create `src/screens/WaveDetail/index.js`: masonry photo grid using `ExpoMasonryLayout` + CachedImage thumbnails, loading wave photos via `feedForWatcher` with `waveUuid`
- [x] 5.3 Create `src/screens/WaveDetail/reducer.js`: wave photo fetching (reuse `feedForWatcher` with wave query), `removePhotoFromWave` call
- [x] 5.4 Implement action buttons row: "Set as Upload Target" and "Add Photos" buttons below header metadata
- [x] 5.5 Implement ⋮ header menu: action sheet with Rename, Edit Description, Delete Wave
- [x] 5.6 Implement rename/edit description modals triggered from ⋮ menu
- [x] 5.7 Implement photo long-press in Wave Detail: context menu with "Remove from Wave" option calling `removePhotoFromWave` mutation
- [x] 5.8 Implement pagination for wave photos: `onEndReached` with `feedForWatcher` + `waveUuid`
- [x] 5.9 Implement empty state when wave has no photos

## 6. Photo Selection Mode

- [x] 6.1 Photo selection uses CachedImage thumbnails with checkmark overlay instead of modifying ExpandableThumb
- [x] 6.2 Create Expo Router route file `app/(drawer)/photo-selection.tsx` with route params (`waveUuid`, `waveName`) and header (title "Add to: {waveName}", Done button)
- [x] 6.3 Create `src/screens/PhotoSelectionMode/index.js`: masonry grid of user's photos (`feedForWatcher` without waveUuid) with selection mode, multi-select state tracking
- [x] 6.4 Implement floating action bar at bottom: shows selected count and "Add to Wave" button
- [x] 6.5 Implement batch `addPhotoToWave` on confirm: iterate selected photo IDs, call mutation for each, show success toast, navigate back to Wave Detail

## 7. Photo Feed Context Menu (Long-Press)

- [x] 7.1 Add `onLongPress` prop to `ExpandableThumb` component, wired through `PhotosListMasonry` from `PhotosList`
- [x] 7.2 Implement wave picker action sheet for "Add to Wave...": fetches user's waves, shows them as options, calls `addPhotoToWave` on selection
- [x] 7.3 Implement "Start New Wave" flow: on iOS uses `Alert.prompt` to create wave inline and add photo; on Android navigates to waves-hub

## 8. Upload Integration

- [x] 8.1 Upload service already accepts `waveUuid` parameter — no changes needed to `usePhotoUploader.js`
- [x] 8.2 Update `src/screens/PhotosList/index.js` camera capture flow to use `uploadTargetWave.waveUuid` instead of `activeWave.waveUuid`
- [x] 8.3 `photoUploadService.js` `addPhotoToWave` call already works correctly — no changes needed

## 9. Navigation & Cleanup

- [x] 9.1 Update drawer `waves.tsx` route to render WavesHub instead of old Waves screen
- [x] 9.2 Remove `ActiveWaveIndicator` component usage from `app/_layout.tsx`
- [x] 9.3 Deprecate `src/components/ActiveWaveIndicator/index.js` with JSDoc comment
- [ ] 9.4 Old `src/screens/Waves/index.js` kept for now — not imported anywhere after waves.tsx update
- [ ] 9.5 `waveAddBus.js` no longer imported after waves.tsx update — kept for reference
- [x] 9.6 `activeWave` atom already deprecated in `src/state.js` with JSDoc pointing to `uploadTargetWave`
