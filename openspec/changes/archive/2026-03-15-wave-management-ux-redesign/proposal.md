## Why

The current wave management UX is buried in the drawer navigation, disconnected from the photo feed, and uses undiscoverable swipe gestures for management actions. The "active wave" concept conflates two distinct intents — viewing a wave's photos and tagging new uploads to a wave — causing accidental behavior. With users accumulating 50+ waves, the text-only flat list doesn't scale, and there's no way to add existing photos to waves or create waves from the photo context. Critical backend capabilities (`removePhotoFromWave`, `Wave.photos` field) exist but have no UI.

## What Changes

- **Wave icon in photo feed header**: Add a ≋ icon to the upper-right corner of the main photo feed header, providing one-tap access to wave management without navigating through the drawer
- **Albums-style Waves Hub screen**: Replace the current flat text list with a visual 2-column grid of wave cards showing 4-photo thumbnail collages, photo counts, and wave metadata
- **Wave Detail screen**: New screen showing a wave's photos in masonry layout (reusing `ExpoMasonryLayout` + `ExpandableThumb`), with explicit action buttons for setting upload target and adding photos
- **Separate upload target from wave viewing**: Split the current `activeWave` atom into `uploadTargetWave` (persistent, controls upload tagging) and navigation-based viewing state (transient, controls which wave's photos are displayed)
- **Add existing photos to waves**: New photo selection mode accessible from Wave Detail, showing the user's uploads with selectable checkmarks, using `addPhotoToWave` mutation
- **Remove photos from waves**: Expose the existing `removePhotoFromWave` backend mutation via long-press context menu in Wave Detail
- **Create wave from photo feed context**: Long-press a photo in the main feed to "Add to Wave..." (pick existing) or "Start New Wave" (create and add in one step)
- **Wave card thumbnails**: Query the `Wave.photos` field (already in backend schema but not queried) to get photo IDs for thumbnail collages and photo counts
- **Search waves**: Client-side search/filter bar in Waves Hub for finding waves by name across 50+ waves
- **Context menus for wave management**: Replace hidden swipe gestures with explicit context menus (long-press on wave cards, ⋮ menu in wave detail)
- **Upload target indicator on ≋ icon**: Badge dot and color tint on the header wave icon when an upload target wave is set, with wave name shown on long-press
- **Remove `ActiveWaveIndicator` banner**: The full-width banner below the header is replaced by the ≋ icon badge and the upload target bar in the Waves Hub
- **Keep drawer Waves entry**: Drawer navigation item remains as an alternative access path, navigating to the same new Waves Hub screen

## Capabilities

### New Capabilities
- `wave-hub`: Albums-style visual grid of waves with thumbnail collages, search, upload target bar, and wave card management via context menus
- `wave-detail`: Individual wave view with masonry photo grid, upload target action, add-photos action, remove-photo-from-wave, and management context menu
- `photo-wave-assignment`: Adding existing photos to waves from a selection mode, creating waves from photo feed long-press context, and removing photos from waves
- `wave-header-icon`: Wave access icon in the photo feed header with upload target badge state

### Modified Capabilities
- `photo-feed`: Header gains ≋ icon in upper-right; photo long-press context menu adds "Add to Wave..." and "Start New Wave" options
- `photo-upload`: Upload tagging reads from new `uploadTargetWave` atom instead of `activeWave`

## Impact

- **State**: `activeWave` atom split into `uploadTargetWave` (persisted) + route-param-based viewing state; all consumers updated
- **Storage**: `waveStorage.js` updated to persist `uploadTargetWave` instead of `activeWave`
- **Screens**: New `WavesHub` screen, new `WaveDetail` screen, new `PhotoSelectionMode` screen; existing `Waves/index.js` retired
- **Components**: New `WaveCard` component (thumbnail collage), new `WaveHeaderIcon` component; `ActiveWaveIndicator` removed; `ExpandableThumb` gains optional selection overlay mode
- **GraphQL**: `listWaves` query updated to include `photos` field; `removePhotoFromWave` mutation added to frontend reducer; `addPhotoToWave` mutation exposed for manual use (currently only used in upload flow)
- **Navigation**: New routes for waves-hub, wave-detail, and photo-selection-mode in Expo Router; drawer entry updated to point to new hub
- **Events**: `waveAddBus.js` updated to trigger create modal from the new hub context
