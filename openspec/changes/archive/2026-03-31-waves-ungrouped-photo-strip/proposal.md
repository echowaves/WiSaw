## Why

The Waves list screen currently shows wave cards with a static 4-photo collage and hides ungrouped photos behind a count badge and kebab menu action. Users cannot see which photos are ungrouped or browse photos within a wave without navigating to the detail screen. The backend now provides `feedForUngrouped` and `feedForWave` paginated queries, enabling richer inline photo browsing.

## What Changes

- Add an **UngroupedPhotosCard** as the first item on the Waves list (shown when `ungroupedPhotosCount > 0`)
  - Visually distinct (accent background, dashed border) to signal "these need organizing"
  - Horizontal scrollable photo strip with paginated loading via `feedForUngrouped`
  - CTA button: "Auto Group Into Waves — fine-tune waves later"
  - Hides when ungrouped count reaches 0 (after auto-group or manual assignment)
- Add a **WavePhotoStrip** shared component for horizontal scrollable photo thumbnails with pagination
  - Used by both UngroupedPhotosCard (`feedForUngrouped`) and WaveCard (`feedForWave`)
- Refactor **WaveCard** to replace the static 4-photo collage with the scrollable WavePhotoStrip
  - Initial data from `listWaves` inline photos; lazy-loads more via `feedForWave` on horizontal scroll
- Add `requestUngroupedPhotos` reducer function for the `feedForUngrouped` GraphQL query

## Capabilities

### New Capabilities

- `ungrouped-photos-card`: Ungrouped photos card component displayed at top of Waves list with horizontal photo strip and auto-group CTA
- `wave-photo-strip`: Shared horizontal scrollable photo strip with paginated loading, used by both ungrouped card and wave cards

### Modified Capabilities

- `wave-hub`: WavesHub renders UngroupedPhotosCard as ListHeaderComponent; WaveCard uses WavePhotoStrip instead of static collage

## Impact

- `src/screens/Waves/reducer.js` — new `requestUngroupedPhotos` function
- `src/components/WavePhotoStrip/index.js` — new shared component
- `src/components/UngroupedPhotosCard/index.js` — new component
- `src/components/WaveCard/index.js` — refactored to use WavePhotoStrip
- `src/screens/WavesHub/index.js` — add ListHeaderComponent for ungrouped card
