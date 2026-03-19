## Why

Users can only add photos to waves via long-press in the feed or batch selection from Wave Detail. There's no way to do it from the expanded photo view, where users spend time reviewing individual photos. Adding a wave action button to the photo detail action bar provides a natural, discoverable path to organize photos into waves.

## What Changes

- Add a 5th "Wave" action button to the expanded photo action bar in the Photo component
- Button shows the wave name if the photo is already in a wave, or "Add to Wave" if not
- Button is disabled for photos not taken by the current device (non-owner photos), with explanatory toast on tap
- Tapping the button opens a modal wave selector with searchable list of user's waves
- From the modal, user can assign the photo to a wave, switch to a different wave, remove from current wave, or create a new wave inline
- Update the `getPhotoDetails` GQL query to include the new `waveName` and `waveUuid` fields from the backend

## Capabilities

### New Capabilities

- `wave-selector-modal`: Reusable modal component for selecting a wave from the user's wave list, with search filtering and inline wave creation

### Modified Capabilities

- `photo-wave-assignment`: Adding a new requirement for wave assignment from expanded photo view via the action bar button

## Impact

- `src/components/Photo/index.js` — new action button in `renderActionCard`, wave selector modal, ownership check logic
- `src/components/Photo/reducer.js` — update `getPhotoDetails` query to include `waveName` and `waveUuid`
- New component: `src/components/WaveSelectorModal/index.js` — modal with FlatList of waves, search, and selection handling
- Existing `addPhotoToWave` and `removePhotoFromWave` from `src/screens/Waves/reducer.js` are reused
