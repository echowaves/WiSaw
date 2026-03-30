## Context

PhotosList currently uses a 3-segment control: Global (0), Starred (1), Search (2). The search segment has its own layout config, empty states, and a `PhotosListSearchBar` component using `KeyboardStickyView`. The `getPhotos` reducer already accepts `searchTerm` alongside `activeSegment`, so the backend supports searching within any segment context. The project uses `react-native-reanimated 4.2.1` for animations.

The search segment is being replaced with a floating action button (FAB) that expands into an inline search bar, allowing search on any segment without context switching.

## Goals / Non-Goals

**Goals:**
- Replace the search segment with a FAB-based inline search overlay
- Support searching within any active segment (Global or Starred)
- Preserve existing search entry points: AI tag clicks (`photoSearchBus`), URL deep links (`searchFromUrl`)
- Clean Reanimated-driven animation for FAB expand/collapse

**Non-Goals:**
- Changing the backend search API or GraphQL queries
- Adding search history, suggestions, or autocomplete
- Modifying the masonry layout configuration for search results (results inherit the active segment's layout)

## Decisions

### 1. SearchFab component architecture

**Decision**: Create a self-contained `SearchFab` component at `src/components/SearchFab/index.js` that manages its own expand/collapse animation state internally. It receives `searchTerm`, `setSearchTerm`, `onSubmitSearch`, `onClearSearch`, and `isExpanded`/`setIsExpanded` as props. The parent (PhotosList) controls the search state; the FAB controls only its visual animation.

**Rationale**: Keeps the animation logic isolated from PhotosList's already-complex state. The parent owns `searchTerm` and `isSearchActive` because it needs them for `load()`/`reload()` calls and to trigger data fetches. The FAB is purely a UI control.

**Alternative considered**: Having the FAB manage its own search term state and emit events — rejected because it duplicates state management and complicates the `searchFromUrl`/`photoSearchBus` entry points which need to set state from outside the FAB.

### 2. FAB expand animation — Reanimated shared value

**Decision**: Use a single Reanimated `useSharedValue` (`progress`, 0→1) to drive the expansion. The FAB container is anchored to the bottom-left. On expand, the container width interpolates from `FAB_SIZE` (56px) to `EXPANDED_WIDTH` (screen width minus margins). The TextInput fades in (`opacity: progress`) and the container grows rightward. The FAB icon stays at the left edge throughout.

**Pattern:**
```
Collapsed:  [🔍]           (56×56, borderRadius 28)
Expanding:  [🔍............]  (width animating)
Expanded:   [🔍  Search...  ✕]  (full width, borderRadius 28)
```

**Rationale**: A single shared value keeps the animation simple and cancellable. `withSpring` gives a natural feel. The FAB icon staying at the left edge means the user's finger doesn't need to move — they tap to open, then the input appears to the right.

**Alternative considered**: `LayoutAnimation` — rejected because it doesn't give fine-grained control over the expand direction and can conflict with other layout changes.

### 3. FAB positioning and keyboard tracking

**Decision**: The FAB is rendered as two sibling elements inside an `Animated.View` wrapper:
- An expanding search bar background (`Animated.View`) that grows R→L behind the FAB
- The FAB button (`Pressable`) that sits on top, never clipped by `overflow: 'hidden'`

The wrapper is absolutely positioned within the PhotosList outer View:

```
position: 'absolute',
bottom: FOOTER_HEIGHT + 16,  // 106px from screen bottom (keyboard closed)
right: 16,
left: 16,
zIndex: 10,
```

The FAB tracks the keyboard using `useReanimatedKeyboardAnimation()` from `react-native-keyboard-controller`. The returned `height` shared value (negative when keyboard is up) drives a `translateY` transform. When the keyboard opens, the bottom offset also animates from `FOOTER_HEIGHT + 16` down to `8px` so the FAB sits snugly above the keyboard without the footer gap stacking.

**Rationale**: Two-sibling architecture avoids `overflow: 'hidden'` clipping the FAB icon and touch target. `useReanimatedKeyboardAnimation` provides frame-perfect sync between keyboard and FAB position — the FAQ slides up smoothly with the keyboard rather than jumping. Reducing the bottom offset when keyboard is open avoids the large gap caused by the hidden footer's space stacking on top of the keyboard.

### 4. Search state management in PhotosList

**Decision**: `isSearchActive` is derived from `searchTerm.length > 0` — it is NOT stored as separate state. When the search input has text, every feed query includes the search term. When the input is empty, queries run without a search filter.

The `searchTerm` is passed as an optional parameter to each segment's own feed endpoint:
- Segment 0 (Global): `feedByDate(... searchTerm: $searchTerm)`
- Segment 1 (Starred): `feedForWatcher(... searchTerm: $searchTerm)`

The standalone `feedForTextSearch` endpoint is NOT used in the mobile app — it is reserved for the web app. The `FEED_FOR_TEXT_SEARCH_QUERY` and `requestSearchedPhotos` function have been removed entirely.

There is no client-side minimum length restriction on search terms. The backend handles filtering for any term length.

All values passed to `load()` use explicit parameter passing to avoid stale React state closures:
- `load(segmentOverride, searchTermOverride, signal, pageOverride)` — each parameter has a corresponding `effective*` variable that falls back to current state only if the override is null.
- `reload()` always passes page 0 explicitly: `load(segmentOverride, searchTermOverride, signal, 0)`.
- `submitSearch()` is minimal: `Keyboard.dismiss()` + `reload(activeSegment, searchTerm)` — no redundant state resets before calling `reload()` (which does its own resets).
- `handleClearSearch()` sets `searchTerm` to empty and collapses the FAB, then calls `reload(activeSegment, '')` passing the empty string explicitly.
- `handleLoadMore()` computes the new page inside `setPageNumber`'s updater and passes it explicitly: `load(null, null, null, newPage)`.

**Rationale**: Deriving `isSearchActive` from the search term eliminates state synchronization bugs — the search term in the input box is the single source of truth. Passing the search term to segment-specific endpoints means search results are always contextual (geo-filtered or watcher-filtered) rather than global. Removing the minimum length guard simplifies the client and lets the backend decide what's meaningful. Explicit parameter passing in `load()` prevents stale closure bugs where React state updates (e.g., `setPageNumber`, `setSearchTerm`) haven't been reflected in the closure by the time `load()` reads them.

### 5. Handling searchFromUrl and photoSearchBus

**Decision**: Both entry points now set `isSearchActive = true`, `setSearchTerm(term)`, expand the FAB, and call `reload(activeSegment, term)`. They no longer set `activeSegment = 2`.

**Rationale**: Direct replacement — same data flow, just targeting the FAB instead of a segment switch.

### 6. Dismissal behavior

**Decision**: Tapping ✕ in the search bar clears the search term, collapses the FAB, and calls `reload(activeSegment, '')` passing an empty search term explicitly to restore the unfiltered segment feed. Since `isSearchActive` is derived from `searchTerm.length > 0`, it automatically becomes false. Tapping the FAB icon when expanded dismisses the keyboard and submits the search (same as keyboard return).

**Rationale**: Simple mental model — one button opens, one closes. No ambiguous intermediate states. Passing the empty string explicitly to `reload()` ensures the cleared search term is used immediately rather than relying on React's async state update.

### 7. Segment removal cleanup

**Decision**: Remove segment 2 entirely:
- `SEGMENT_TITLES`: `['Global', 'Starred']`
- `SEGMENT_ICONS`: remove search entry
- `segmentConfig` switch: remove `case 2`
- `updateIndex`: remove `index === 2` search term special case
- Remove all `activeSegment === 2` render conditionals
- Delete `PhotosListSearchBar` component
- Remove search case from `PhotosListEmptyState`

**Rationale**: Clean removal — no dead code. All search paths are replaced by the FAB.

### 8. No-results state

**Decision**: When a search returns zero results (`photosList.length === 0 && stopLoading && isSearchActive`), show an `EmptyStateCard` with "No results for '{term}'" message and a "Clear Search" action that dismisses search mode. This renders in the existing empty-state branch, not as a new branch.

**Rationale**: Reuses the existing empty-state rendering pattern. The FAB stays expanded so the user can refine their query.

## Risks / Trade-offs

- [Trade-off: FAB occludes content] The FAB covers a small area of the masonry layout in the bottom-left corner. This is acceptable — FABs are a standard mobile pattern and the area is minimal (~56×56px).
- [Trade-off: No dedicated search layout] Search results now use the active segment's layout (compact tiles for Global, larger tiles with comments for Starred) without any modifications. The `shouldShowComments` flag in `PhotosListMasonry` is driven solely by `activeSegment === 1`, not by search state. This is intentional — search is contextual within a segment and should never alter the visual layout.
- [Risk: Reanimated worklet on web] Reanimated works on web via `react-native-reanimated`, but spring animations may behave slightly differently. Acceptable since search functionality works regardless and web is a secondary platform.
- [Risk: Keyboard interaction] The expanded search bar uses a regular `TextInput`. The FAB tracks the keyboard position using `useReanimatedKeyboardAnimation` from `react-native-keyboard-controller`, which provides smooth frame-synced animation. This avoids `KeyboardStickyView` (which caused the previous screen-freeze bug) while still giving precise keyboard tracking. The bottom offset animates from `FOOTER_HEIGHT + 16` to `8px` when the keyboard opens so the FAB sits snugly above the keyboard. The keyboard is dismissed on search submit (both FAB icon tap and keyboard return key). Auto-focus only fires on the collapsed→expanded transition (tracked via a `useRef`), preventing the keyboard from popping back up on re-renders after results load. The masonry layout does NOT resize when the keyboard opens — photos may scroll under the keyboard, which is acceptable since the search bar is a brief interaction.
