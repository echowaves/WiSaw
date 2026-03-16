## Context

The WiSaw app has a waves feature that lets users group photos into visual albums. The current implementation uses an "upload target wave" concept — a persistent atom stored in SecureStore that tags new camera captures to a pre-selected wave. This requires users to explicitly set/clear upload targets, with badge indicators scattered across the UI (header icon, drawer, footer nav button) to remind them of the active target.

The main feed's `getPhotos()` reducer also accepts an `activeWave` parameter, coupling the 3 feed segments to wave filtering. The wave detail screen (`WaveDetail`) is a minimal view with plain thumbnails, no expand/collapse, no comments, and no footer — a second-class experience compared to the main feed.

Key files involved:
- `src/state.js` — `activeWave` (deprecated) and `uploadTargetWave` atoms
- `src/screens/PhotosList/index.js` — 1800+ lines, uses both wave atoms
- `src/screens/PhotosList/reducer.js` — `getPhotos()` with optional `waveUuid` via `FEED_FOR_WATCHER_WITH_WAVE_QUERY`
- `src/screens/WaveDetail/index.js` — simple masonry with `CachedImage`, no `ExpandableThumb`
- `src/screens/WavesHub/index.js` — includes upload target bar
- `src/components/WaveHeaderIcon/index.js` — badge dot and color tinting
- `src/screens/PhotosList/components/PhotosListFooter.js` — badge on nav button

## Goals / Non-Goals

**Goals:**
- Eliminate the upload target concept and all its UI indicators
- Make the 3 main feed segments wave-agnostic
- Give WaveDetail full interaction parity with the starred photos layout (expand/collapse, comments, AI tags, action buttons, quick actions modal, camera footer)
- Contextual wave uploads: photos taken from WaveDetail's footer are automatically tagged to that wave
- Use the new `feedForWave` GraphQL query for wave-scoped photo fetching

**Non-Goals:**
- Refactoring PhotosList into smaller components (that's a separate effort)
- Changing the wave card design or Waves Hub grid layout
- Modifying wave CRUD operations (create, edit, delete, auto-group)
- Optimizing PhotosList performance beyond removing wave coupling

## Decisions

### Decision 1: Reuse shared components in WaveDetail, don't reuse PhotosList

WaveDetail will import and compose the same presentation components used by PhotosList — `PhotosListMasonry`, `ExpandableThumb`, `PhotosListFooter`, `PendingPhotosBanner`, `QuickActionsModalWrapper` — but will manage its own state (photos, pagination, expand/collapse, dimensions).

**Why not render PhotosList with a "wave mode" prop?** PhotosList is 1800+ lines with 72+ hooks. Adding a wave mode would increase its complexity and create branching logic throughout. A separate screen using shared components is cleaner, more maintainable, and easier to reason about.

**Why not extract a shared hook?** The state management between PhotosList and WaveDetail diverges enough (3 segments vs. single feed, search, location-based filtering, wave-specific actions) that a shared hook would become a leaky abstraction. Shared components with independent state is the right level of reuse.

### Decision 2: Pass waveUuid through PhotosListFooter to camera flow

Add an optional `waveUuid` prop to `PhotosListFooter`. When present, the `onCameraPress` callback receives it, and the upstream handler passes it to `enqueueCapture({ ..., waveUuid })`. When absent (main feed), no wave is attached to uploads.

This keeps the footer a pure presentational component — it doesn't know about wave state, it just forwards a value. The WaveDetail screen provides the waveUuid; PhotosList provides nothing.

**Alternative considered: Reading wave context from a Jotai atom.** This would recreate the upload target pattern we're removing. Explicit prop passing is clearer and avoids hidden state.

### Decision 3: Replace feedForWatcher(waveUuid) with feedForWave

The backend provides a new `feedForWave(uuid, pageNumber, batch, waveUuid)` query specifically for wave-scoped feeds. `WaveDetail/reducer.js` will use this instead of `feedForWatcher` with a `waveUuid` parameter. The main feed's `feedForWatcher` query will drop the `waveUuid` parameter entirely — it always returns the full, wave-agnostic feed.

### Decision 4: WaveDetail uses starred-layout segment config

WaveDetail will use the same masonry configuration as PhotosList's segment 1 (Starred): `spacing: 8`, responsive column count, `baseHeight: 200`, square aspect ratio fallbacks. This gives photos more room and matches the comments-with-thumbnails presentation.

### Decision 5: PendingPhotosBanner shows all pending uploads

The `PendingPhotosBanner` in WaveDetail shows all pending uploads regardless of wave, same as the main screen. This is simpler (no filtering logic in the upload queue) and gives the user a consistent view of their upload status wherever they are.

### Decision 6: Clean removal of upload target infrastructure

Remove in this order to avoid dangling references:
1. Remove all UI consumers (`WaveHeaderIcon` badge, drawer badge/subtitle, footer badge, WavesHub upload bar, WaveDetail "Set Upload Target" button)
2. Remove atom usage from PhotosList, WavesHub, WaveDetail, app init
3. Remove atoms from `state.js`
4. Remove persistence functions from `waveStorage.js`

## Risks / Trade-offs

- [WaveDetail duplicates some PhotosList state patterns] → This is intentional. The alternative (sharing state via PhotosList) would create worse coupling. The duplicated patterns (expandedPhotoIds, pagination, dimension calculation) total ~100 lines and are straightforward.
- [Users lose the ability to batch-upload to a wave from the main feed] → Mitigated by the fact that WaveDetail now has a full camera footer. Users go to the wave, take photos there. This is a simpler mental model.
- [Removing activeWave from feed segments changes behavior] → Currently `activeWave` can filter the Global feed to show only photos from a specific wave. This capability moves entirely to WaveDetail. If users were using this, they'll find the same content by navigating to the wave.
- [PendingPhotosBanner requires usePhotoUploader hook in WaveDetail] → WaveDetail will need to call `usePhotoUploader` to get pending photos state and upload animations. This hook may have dependencies on PhotosList-specific state. If so, we'll need to make it screen-agnostic or extract the read-only portion.
