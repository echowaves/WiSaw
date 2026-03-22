## Context

Wave state is entirely component-local. WavesHub stores waves in `useState`, WaveDetail stores photos in `useState`, and the waves index screen stores the ungrouped count in `useState`. None of these screens re-fetch data when they regain focus. The header title in `[waveUuid].tsx` reads from immutable route params set at navigation time.

The app already uses `useFocusEffect` in PhotosList and Feedback screens. The existing `loadWaves` and `loadPhotos` functions already support full refresh via parameters. `router.setParams()` is available in Expo Router but not yet used anywhere.

## Goals / Non-Goals

**Goals:**
- All wave screens show current data when focused
- Header title updates immediately after rename without navigation
- Zero new abstractions — reuse existing patterns (`useFocusEffect`, `router.setParams`)

**Non-Goals:**
- Event bus or cross-screen synchronization mechanism
- Real-time subscriptions for wave changes
- Optimistic UI for photo removal within WaveDetail (refresh-on-focus is sufficient)
- Prop drilling `onPhotoDeleted` through ExpandableThumb → Photo

## Decisions

### 1. useFocusEffect for all three screens
**Choice**: Add `useFocusEffect` that calls the existing data-loading function on every focus.
**Alternatives considered**:
- *Event bus (wavePhotoBus)*: More immediate updates but adds a new abstraction. The codebase has 4 event buses already; adding another for a problem solvable with focus refresh adds unnecessary complexity.
- *Dirty flag + conditional refresh*: Fewer network calls, but requires cross-screen coordination to set the flag — the same coupling we're avoiding.
**Rationale**: Always-refresh is consistent, simple, and the `listWaves` query already uses `fetchPolicy: 'network-only'`. The data is small (wave metadata, photo pages).

### 2. router.setParams for header title
**Choice**: Call `router.setParams({ waveName: editName })` in WaveDetail's `handleSaveEdit` after the mutation succeeds.
**Alternatives considered**:
- *Expose waveName via ref + useImperativeHandle*: Route file would need to subscribe to WaveDetail's state — tighter coupling.
- *Move waveName to Jotai atom*: Overkill for a single field scoped to one screen.
**Rationale**: `router.setParams` is the Expo Router primitive for this. One line, no new state, no coupling.

### 3. WaveDetail focus refresh resets pagination
**Choice**: On focus, reset to page 0 with a new batch UUID and reload photos from scratch (`loadPhotos(0, newBatch)`). Collapse all expanded photos.
**Rationale**: Partial refresh (keeping existing pages, appending changes) would require diffing server response against local state. Full reset is simpler and guarantees correctness. Expanded photo state becomes stale after backend changes, so resetting expansion avoids showing stale expanded content.

## Risks / Trade-offs

- [Network cost on every focus] → Wave list and photo list queries are lightweight. `listWaves` returns metadata only; `feedForWave` returns one page. Acceptable for correctness.
- [WaveDetail expansion state lost on focus return] → If user expands a photo, navigates away, and returns, the photo collapses. This is acceptable — the alternative (preserving expansion through data refresh) is complex and the expanded content may be stale.
- [Flash of loading state on focus] → The `LinearProgress` bar briefly shows during refetch. This is actually helpful — it signals fresh data is loading.
