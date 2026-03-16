## 1. Update getPhotoDetails Query

- [x] 1.1 Add `waveName` and `waveUuid` fields to the `getPhotoDetails` GQL query in `src/components/Photo/reducer.js`

## 2. Create WaveSelectorModal Component

- [x] 2.1 Create `src/components/WaveSelectorModal/index.js` with Modal, FlatList of waves, search TextInput, loading state, "None (remove from wave)" option when `currentWaveUuid` is provided, and "Create New Wave" option with inline text input at the top of the list
- [x] 2.2 Style the modal: themed card background, rounded corners, dimmed backdrop, wave items with name and photo count, highlighted current wave

## 3. Add Wave Action Button to Photo Action Bar

- [x] 3.1 Add wave action button to `renderActionCard` in `src/components/Photo/index.js` between Star and Share, showing `waveName` or "Add to Wave" based on `photoDetails.waveName`
- [x] 3.2 Add ownership check: disable button when `photo.uuid !== uuid`, show explanatory toast on tap when disabled
- [x] 3.3 Add WaveSelectorModal state (`waveModalVisible`) and render the modal in the Photo component
- [x] 3.4 Implement `handleWaveSelect`: call `addPhotoToWave`, optimistically update `photoDetails` with new `waveName`/`waveUuid`, show success toast, revert on error
- [x] 3.5 Implement `handleWaveRemove`: call `removePhotoFromWave`, optimistically clear `waveName`/`waveUuid` from `photoDetails`, show success toast, revert on error
- [x] 3.6 Implement `handleCreateWave`: call `createWave` then `addPhotoToWave`, optimistically update `photoDetails` with new wave info, show success toast, revert on error
