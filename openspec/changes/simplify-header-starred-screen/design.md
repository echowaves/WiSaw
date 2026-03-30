## Context

The PhotosList screen currently contains a 2-segment control (Global / Starred) in the header. Both segments share the same screen component, with segment-dependent branching throughout `PhotosList/index.js` (~1200 lines) and `reducer.js`. The two feeds have fundamentally different data sources:

- **Global** — `feedByDate` GraphQL query, requires GPS location, date-based pagination, drift detection
- **Starred** — `feedForWatcher` GraphQL query, requires user UUID, simple page-number pagination, no location dependency

Three hooks are already extracted and segment-independent: `usePhotoExpansion`, `useCameraCapture`, `usePendingAnimation`. The remaining shared logic (feed loading, pagination, search) is inline in the screen component.

The drawer currently has: Home, Identity, Friends, Waves, Feedback.

## Goals / Non-Goals

**Goals:**
- Simplify the main screen header by removing the segment control
- Create a standalone Starred screen accessible from the drawer
- Extract shared feed logic into hooks so both screens reuse pagination, search, and event subscription code without duplication
- Keep Global and Starred independently extensible

**Non-Goals:**
- Changing the header icons (identity dropdown and waves icon remain as-is)
- Adding new header content (search bar, title, etc.) — center remains empty for now
- Modifying the GraphQL queries or backend
- Refactoring the masonry layout or photo expansion logic (already extracted)
- Moving Waves icon out of the header
- Changing camera/upload flow

## Decisions

### 1. Hook extraction strategy: two focused hooks

**Decision:** Extract `useFeedLoader` and `useFeedSearch` as two separate hooks rather than one monolithic `useFeed` hook.

**Rationale:** Each hook has a clear single responsibility. `useFeedLoader` owns the data lifecycle (fetch, paginate, abort, freeze, dedup, event subscriptions). `useFeedSearch` owns search state and coordination. They compose cleanly — `useFeedSearch` calls into `useFeedLoader.reload()` when search changes. A single combined hook would be harder to test and reason about.

**Alternative considered:** One `useFeed` hook combining both — rejected because search is optional (Starred may not even need search initially) and the concerns are separable.

### 2. Hook location: keep in PhotosList/hooks/

**Decision:** Place `useFeedLoader` and `useFeedSearch` in `src/screens/PhotosList/hooks/` alongside existing hooks.

**Rationale:** These hooks are tightly coupled to the photo feed data model (frozen photos, masonry config, photo search bus). They're not general-purpose app hooks. The Starred screen will import from this path. If more screens need them later, they can be promoted to `src/hooks/`.

### 3. `useFeedLoader` parameterized by `fetchFn`

**Decision:** `useFeedLoader` accepts a `fetchFn` parameter that encapsulates the data source query. Global passes `requestGeoPhotos`, Starred passes `requestWatchedPhotos`. The hook itself is source-agnostic.

**Rationale:** This is the minimal abstraction that eliminates the segment switch inside `reducer.getPhotos()`. Each screen owns its data source; the hook owns the lifecycle. The `fetchFn` signature follows what `getPhotos()` already uses: `({ location, uuid, pageNumber, batch, searchTerm, ... }) => Promise<{ photos, batch, noMoreData, nextPage }>`.

**Alternative considered:** Passing a segment index and keeping the switch inside the hook — rejected because it defeats the purpose of separation.

### 4. Starred screen as a drawer-level route

**Decision:** Add `app/(drawer)/starred.tsx` as a direct drawer screen (not nested under `(tabs)`).

**Rationale:** Starred is a standalone feed, not a tab within the home stack. It doesn't need the tab navigation context. It gets its own entry in the drawer between Identity and Friends, matching the proposal. Uses `AppHeader` component (already exists) for a consistent header with back/drawer navigation.

### 5. Header simplification: remove segments, keep icons

**Decision:** `PhotosListHeader` removes the segment control entirely. Left side keeps `IdentityHeaderIcon`, right side keeps `WaveHeaderIcon`, center is empty.

**Rationale:** With only one "segment" (Global), there's nothing to toggle. The empty center keeps the header minimal per user preference. Center content (search bar, title, etc.) can be added later as a separate change.

### 6. No camera capture on Starred screen

**Decision:** The Starred screen will not include camera capture functionality (`useCameraCapture`) or upload-related UI (pending banner).

**Rationale:** Photos are geo-tagged when captured. Camera capture semantically belongs to the location-based Global feed. Starred is a consumption/review screen for content you've interacted with. Uploads wouldn't appear in Starred unless the user then interacts with them.

### 7. Starred empty state navigates home

**Decision:** When Starred has no content, the empty state shows "No Starred Content Yet" with a "Discover Content" button that navigates to the home screen via `router.navigate('/(drawer)/(tabs)')`.

**Rationale:** Previously `updateIndex(0)` switched to Global within the same screen. Now it's a navigation action, which is actually cleaner — the user is explicitly going to a different screen. Standard Expo Router navigation.

## Risks / Trade-offs

**[Risk] `useFeedLoader` abstraction may not cleanly fit both fetch functions** → The two fetch functions have different required parameters (Global needs `location` + `zeroMoment`, Starred needs `uuid`). Mitigation: `useFeedLoader` passes through all available context to `fetchFn`; each `fetchFn` picks what it needs. The hook doesn't need to know about location vs UUID semantics.

**[Risk] T&C check, background task, and notification permissions are currently in PhotosList mount effects** → These are app-level concerns coupled to the home screen. Mitigation: Keep them in the Global screen (PhotosList) since it's still the app entry point. If the user deep-links to Starred, these won't fire — but that's acceptable since deep links currently go to specific photos, not the Starred feed.

**[Risk] Upload bus subscription in shared hook vs Global-only** → `useFeedLoader` subscribes to `uploadBus` to prepend new photos. On Starred, this would incorrectly show newly uploaded photos (they aren't "starred" yet). Mitigation: Make the upload subscription opt-in via a `subscribeToUploads` parameter on `useFeedLoader`, defaulting to `false`. Global passes `true`.

**[Trade-off] Two screens with similar rendering code** → Both Global and Starred will render `PhotosListMasonry`, `SearchFab`, etc. This is intentionally not abstracted into a shared "FeedScreen" wrapper — the screens are thin enough that the repetition is minimal and keeps each screen's render tree explicit and easy to modify independently.
