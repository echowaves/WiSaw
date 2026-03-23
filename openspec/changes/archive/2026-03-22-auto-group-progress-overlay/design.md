## Context

The `handleAutoGroup` function in WavesHub runs a `do-while(hasMore)` loop calling `autoGroupPhotos` per batch. An `autoGrouping` boolean state already exists but is never rendered. Each API response includes `photosGrouped`, `photosRemaining`, and `hasMore`, providing sufficient data for progress tracking. The app already uses `Modal` from react-native for the create-wave dialog.

## Goals / Non-Goals

**Goals:**
- Show a progress overlay during auto-grouping that updates after each batch
- Display running totals: photos grouped so far and waves created so far
- Block user interaction during the operation to prevent double triggers
- Use only existing react-native components (Modal, ActivityIndicator, View, Text)

**Non-Goals:**
- Percentage-based progress bar (batch count is not known upfront since the API doesn't return total batch count)
- Cancelable auto-group (would require API support)
- New event bus channels for progress updates (the overlay lives in WavesHub, same component as the loop)

## Decisions

### 1. Transparent Modal overlay with ActivityIndicator and text
**Choice**: Render a `<Modal transparent visible={autoGrouping}>` with a centered card containing an ActivityIndicator and two lines of progress text.
**Rationale**: The `autoGrouping` state already exists and is toggled correctly. A Modal prevents interaction and is the established overlay pattern (create-wave modal uses the same approach). No new state variables needed for visibility.

### 2. Progress state via existing local variables
**Choice**: Add `autoGroupProgress` state `{ photosGrouped: number, wavesCreated: number }` and update it after each batch iteration inside the existing loop.
**Rationale**: The loop already tracks `totalWavesCreated` and `totalPhotosGrouped` as local variables. Promoting them to state (or adding a parallel state) lets React re-render the overlay text after each batch.

### 3. Overlay styling matches existing modal pattern
**Choice**: Semi-transparent dark backdrop (`rgba(0,0,0,0.5)`) with a centered card using `theme.CARD_BACKGROUND`, matching the create-wave modal's visual style.
**Rationale**: Visual consistency with existing modals.

## Risks / Trade-offs

- [State updates in a tight loop] → Low risk; each iteration is an async API call (network-bound), so React has time to re-render between batches. No performance concern.
- [Modal blocks all interaction] → This is intentional. The user should not interact with the wave list during grouping.
