## Context

PhotosList shows a 3px `LinearProgress` bar at the top of the content area whenever `loading` is true. This non-blocking animated bar provides visual feedback during both initial load and pagination without interrupting user interaction. WaveDetail uses a centered `ActivityIndicator` only on empty state, and Waves has no list-level loading indicator.

## Goals / Non-Goals

**Goals:**
- Add the same `LinearProgress` bar pattern to WaveDetail and Waves screens
- Remove the centered `ActivityIndicator` from WaveDetail to match PhotosList behavior
- Use the identical styling: 3px height, `CONST.MAIN_COLOR`, `theme.HEADER_BACKGROUND` track

**Non-Goals:**
- Changing the `LinearProgress` component itself
- Adding loading indicators to other screens (PhotoSelectionMode, WaveSelectorModal, etc.)
- Changing pull-to-refresh behavior (FlatList's built-in refresh indicator in Waves stays)

## Decisions

### Decision 1: Place LinearProgress bar between header and content in both screens

Match the PhotosList pattern: the progress bar sits just below the header/safe-area and above the scrollable content. In WaveDetail this is above the `PhotosListMasonry`. In Waves this is above the `FlatList`.

**Why:** Visual consistency. Users see the same loading indicator in the same position across all photo/wave screens.

### Decision 2: Remove WaveDetail centered ActivityIndicator

PhotosList does not show a centered spinner for empty state — it just shows the `LinearProgress` bar plus any empty-state card. WaveDetail should do the same for consistency.

**Why over keeping both:** The user asked for consistency with PhotosList. PhotosList uses only `LinearProgress` and an `EmptyStateCard` for the empty case — no centered spinner.

### Decision 3: Show LinearProgress whenever `loading` is true

Both screens already have a `loading` state variable that covers initial load, pagination, and refresh. Tying the bar to `loading` means it shows in all three cases — same as PhotosList.

## Risks / Trade-offs

- [Risk: Removing the centered spinner in WaveDetail means no feedback when the screen is completely empty during first load] → Mitigated by the `LinearProgress` bar being visible at the top + the `EmptyStateCard` rendering when photos array is empty after load completes.
