## Context

The Waves Hub screen (`WavesHub/index.js`) manages wave albums but lacks the auto-group action in its header — it only exists as an inline button within the old Waves list (`Waves/index.js`). The GraphQL schema has a `getUngroupedPhotosCount(uuid)` query that returns the number of photos not assigned to any wave, which can power a badge on the auto-group button.

Separately, `WaveCard` shows photo count via `wave.photos.length`, where `photos: [String]` is an array of photo IDs. The GraphQL `Wave` type also exposes `photosCount: Int` — a server-computed count that is more reliable (doesn't depend on array truncation/pagination).

## Goals / Non-Goals

**Goals:**
- Show auto-group button with ungrouped photo count badge in the Waves header nav bar
- Display accurate photo count from `photosCount` field on wave cards
- Use the existing `getUngroupedPhotosCount` GraphQL query (already in schema)

**Non-Goals:**
- Changing the auto-group mutation behavior
- Adding auto-group to the main photo feed header
- Modifying wave detail or photo selection screens

## Decisions

### 1. Auto-group button placement: header `rightSlot` of AppHeader
**Rationale**: The route files (`waves.tsx`, `waves-hub.tsx`) render `AppHeader` which accepts a `rightSlot` prop. Placing the button there keeps it always visible without scrolling and follows the existing pattern used in the old waves screen's `+` button.
**Alternative considered**: Floating action button — rejected because the header already has the slot infrastructure and FABs would conflict with the search bar.

### 2. Fetch ungrouped count on mount via `getUngroupedPhotosCount` query
**Rationale**: The query exists in the schema and returns a simple `Int!`. Calling it on screen mount/refresh provides the badge count without requiring a separate mutation dry-run.
**Alternative considered**: Using `autoGroupPhotosIntoWaves` response `photosRemaining` — rejected because it requires actually executing a mutation.

### 3. Replace `photos` array with `photosCount` in `listWaves` query
**Rationale**: `photosCount: Int` is a server-side aggregate, always accurate. The `photos: [String]` array is used only for counting in the card display and could be truncated. Switching to `photosCount` is a single field swap.
**Alternative considered**: Keeping both fields — rejected to avoid fetching an unnecessary array of IDs.

### 4. Ungrouped count and auto-group logic live in `WavesHub/index.js`
**Rationale**: The WavesHub screen already has the auto-group handler (`handleAutoGroup`). Adding the count fetch there keeps state co-located. The count is passed up to the route file via a callback or the route file fetches it independently.
**Decision**: The route files (`waves.tsx`/`waves-hub.tsx`) will render the auto-group button in the header's `rightSlot`, fetching the ungrouped count directly in the route component since the header is defined there. The auto-group action will call into WavesHub via an event bus (same pattern as the existing `waveAddBus`).

## Risks / Trade-offs

- **[Extra network call on mount]** → The `getUngroupedPhotosCount` query is lightweight (returns a single integer); negligible overhead
- **[Count stale after auto-group]** → Refresh the count after auto-group completes; also refresh on pull-to-refresh
- **[Removing `photos` field from listWaves]** → Any code reading `wave.photos` will get `undefined`. WaveCard already has a fallback (`wave.photos ? wave.photos.length : 0`), and the thumbnails come from a separate `fetchWaveThumbnails` call, not from the `photos` field. Risk is minimal.
