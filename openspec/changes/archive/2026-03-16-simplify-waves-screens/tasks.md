## 1. Remove Upload Target UI Indicators

- [x] 1.1 Remove badge dot and color tinting from `WaveHeaderIcon/index.js`; remove `uploadTargetWave` atom read and long-press handler; make icon a simple navigation button with secondary text color
- [x] 1.2 Remove upload target badge and subtitle from drawer Waves item in `app/(drawer)/_layout.tsx`; remove `uploadTargetWave` atom read
- [x] 1.3 Remove `hasUploadTarget` badge from nav button in `PhotosListFooter.js`; remove `hasUploadTarget` prop usage
- [x] 1.4 Remove upload target bar and `handleSetUploadTarget` from `WavesHub/index.js`; remove `uploadTargetWave` atom read and `saveUploadTargetWave`/`clearUploadTargetWave` imports
- [x] 1.5 Remove "Set Upload Target" button and `handleSetUploadTarget` from `WaveDetail/index.js`; remove `uploadTargetWave` atom read
- [x] 1.6 Remove "Set as Upload Target" from wave card context menu in `WavesHub/index.js`

## 2. Remove Wave Coupling from Main Feed

- [x] 2.1 Remove `activeWave` atom usage from `PhotosList/index.js`: remove atom read, remove `activeWave` parameter from `load()` calls, remove clear-wave button/UI, remove `setActiveWave` and `saveActiveWave` calls
- [x] 2.2 Remove `FEED_FOR_WATCHER_WITH_WAVE_QUERY` from `PhotosList/reducer.js`; update `getPhotos()` to always use the simple `FEED_FOR_WATCHER_QUERY` without `waveUuid` parameter; remove `activeWave` from params destructuring
- [x] 2.3 Remove `hasUploadTarget` prop from `PhotosListFooter` usage sites in `PhotosList/index.js`

## 3. Clean Up State and Storage

- [x] 3.1 Remove `activeWave` and `uploadTargetWave` atoms from `src/state.js`
- [x] 3.2 Remove `saveUploadTargetWave`, `loadUploadTargetWave`, `clearUploadTargetWave` functions from `src/utils/waveStorage.js`
- [x] 3.3 Remove `loadUploadTargetWave` from app initialization in `app/_layout.tsx`; remove `setActiveWave` and `setUploadTargetWave` from init flow; remove related imports

## 4. Add waveUuid Prop to PhotosListFooter

- [x] 4.1 Add optional `waveUuid` prop to `PhotosListFooter`; pass it through `onCameraPress` callback so upstream handlers receive the wave context
- [x] 4.2 Update `checkPermissionsForPhotoTaking` and `enqueueCapture` call sites in `PhotosList/index.js` to accept and forward an optional `waveUuid` parameter (defaulting to undefined for main feed)

## 5. Add feedForWave Query to WaveDetail Reducer

- [x] 5.1 Replace the `feedForWatcher` query in `WaveDetail/reducer.js` with a `feedForWave` query that takes `uuid`, `pageNumber`, `batch`, and `waveUuid` parameters

## 6. Redesign WaveDetail Screen

- [x] 6.1 Add state management to WaveDetail for expand/collapse: `expandedPhotoIds`, `getCalculatedDimensions`, `isPhotoExpanded`, `handlePhotoToggle`, `updatePhotoHeight`, dimension calculation using starred-layout segment config
- [x] 6.2 Replace plain `CachedImage` masonry with `PhotosListMasonry` component using starred-layout config (spacing: 8, responsive columns, baseHeight: 200, showComments: true)
- [x] 6.3 Add `PendingPhotosBanner` to WaveDetail by wiring up `usePhotoUploader` hook for pending photos state and upload animations
- [x] 6.4 Add `PhotosListFooter` to WaveDetail with `waveUuid` prop set to the current wave's UUID; wire up camera permissions and `enqueueCapture` with wave context
- [x] 6.5 Add `QuickActionsModalWrapper` to WaveDetail with long-press handler wired to the masonry's `onPhotoLongPress`
- [x] 6.6 Remove the old action row ("Set Upload Target" / "Add Photos" buttons), photo count label, and plain masonry from WaveDetail
- [x] 6.7 Update `app/(drawer)/wave-detail.tsx` route to support the redesigned WaveDetail screen layout
