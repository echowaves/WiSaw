## 1. Add onRemovedFromWave callback to usePhotoActions

- [x] 1.1 Add `onRemovedFromWave` parameter to `usePhotoActions` hook. In `handleWaveRemove`, call `onRemovedFromWave(photo.id)` immediately after `setWaveModalVisible(false)` (before the mutation). In `handleWaveSelect`, call `onRemovedFromWave(photo.id)` immediately after `setWaveModalVisible(false)` (before the mutation). Guard both calls with `if (onRemovedFromWave)`.

## 2. Wire onPhotoRemovedFromWave through QuickActionsModal

- [x] 2.1 Add `onPhotoRemovedFromWave` prop to `QuickActionsModal`. Create `handleRemovedFromWave` callback that calls `onClose()` then `onPhotoRemovedFromWave(photoId)` (guarded). Pass `handleRemovedFromWave` as `onRemovedFromWave` to `usePhotoActions`.

## 3. Connect WaveDetail's QuickActionsModalWrapper

- [x] 3.1 In WaveDetail's `QuickActionsModalWrapper`, pass `onPhotoRemovedFromWave` to `QuickActionsModal` that filters the photo from the `photos` state — same as the existing `onPhotoDeleted` handler.
