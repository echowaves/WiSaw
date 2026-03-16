## 1. Extract usePhotoActions Hook

- [x] 1.1 Create `src/hooks/usePhotoActions.js` with handler logic extracted from `Photo/index.js`: `handleBan`, `handleDelete`, `handleFlipWatch`, `handleWaveButtonPress`, `handleWaveSelect`, `handleWaveRemove`, `handleCreateWave`, `isPhotoBannedByMe`, `isOwnPhoto`, plus `bans` and `waveModalVisible` state
- [x] 1.2 Wire `Photo/index.js` to use `usePhotoActions` hook instead of inline handler code; pass `onDeleted` as no-op; verify expanded photo view behavior is unchanged

## 2. Extract PhotoActionButtons Component

- [x] 2.1 Create `src/components/PhotoActionButtons/index.js` with the 5-button JSX extracted from `renderActionCard()` in `Photo/index.js`, including `actionButton`, `actionButtonDisabled`, `actionButtonText` styles and icon-only/round disabled rendering
- [x] 2.2 Wire `Photo/index.js` to render `PhotoActionButtons` inside `renderActionCard()` instead of inline button JSX; verify expanded photo view behavior is unchanged

## 3. Create QuickActionsModal Component

- [x] 3.1 Create `src/components/QuickActionsModal/index.js` with modal overlay, photo thumbnail preview, loading spinner, and `PhotoActionButtons`
- [x] 3.2 Fetch `getPhotoDetails` on modal open; manage local `photoDetails` state; transition buttons from disabled to enabled when data arrives
- [x] 3.3 Wire `usePhotoActions` hook inside the modal with `onDeleted` callback that closes the modal and calls `onPhotoDeleted` prop
- [x] 3.4 Render `WaveSelectorModal` inside the modal, controlled by the hook's `waveModalVisible` state

## 4. Replace Long-Press Handler in PhotosList

- [x] 4.1 Add `longPressPhoto` state to `PhotosList/index.js`; replace `handlePhotoLongPress` body with setting this state; render `QuickActionsModal` with the selected photo
- [x] 4.2 Wire `onPhotoDeleted` callback to filter the photo from `photosList`; wire `onClose` to clear `longPressPhoto` state
- [x] 4.3 Remove unused ActionSheetIOS import, `listWavesForPicker` call, and related wave-picker code from `PhotosList/index.js`
