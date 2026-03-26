## Context

WavesHub renders a plain `TextInput` search bar conditionally (`waves.length > 0`). PhotosList renders `PhotosListSearchBar` (a `KeyboardStickyView`-wrapped floating bar) inside a flex container in the results branch, but outside it in the empty/default branches. These inconsistencies cause three visible bugs.

Relevant files:
- `src/screens/WavesHub/index.js` — waves search bar, empty state
- `src/screens/PhotosList/index.js` — search bar placement per render branch
- `src/screens/PhotosList/components/PhotosListSearchBar.js` — reference for clear button pattern

## Goals / Non-Goals

**Goals:**
- Add a clear button to the Waves search input (matching PhotosListSearchBar's pattern)
- Ensure the Waves search bar remains visible when a search returns zero results
- Show a search-aware empty state in Waves when search yields no results
- Eliminate the layout gap in Photos search results by moving the search bar outside the flex container

**Non-Goals:**
- Adding a submit button to the Waves search bar (Waves search auto-submits via debounce)
- Refactoring PhotosListSearchBar into a shared component for both screens
- Changing the search debounce timing or search API behavior

## Decisions

### 1. Waves clear button: inline icon, not a separate component

Add a `TouchableOpacity` with `Ionicons close` icon inside the existing search bar `View`, positioned absolutely on the right side of the `TextInput`. Show it conditionally when `searchText` is non-empty. On press: clear `searchText` and refocus the input.

**Why not extract a shared SearchBar component?** The Waves search bar is fundamentally different (auto-submit via debounce, no explicit submit button, simpler styling). A shared component would require over-abstraction for this fix.

### 2. Waves search bar visibility: show when `searchText` is non-empty OR `waves.length > 0`

Change the guard from `{waves.length > 0 && (` to `{(waves.length > 0 || searchText.length > 0) && (`. This ensures the search bar stays visible when a search returns zero results.

### 3. Waves empty state: search-aware `ListEmptyComponent`

When `searchText` is non-empty, the `ListEmptyComponent` should render a "No Results Found" empty state with a "Clear Search" action (that clears `searchText`) instead of the default "No Waves Yet" / "Create a Wave" messaging.

### 4. Photos search bar: move outside the flex container in results branch

Move `<PhotosListSearchBar>` from inside `<View style={styles.container}>` to be a sibling of `<PhotosListFooter>` at the top level, identical to its placement in the default/empty-state render branches. `KeyboardStickyView` uses absolute positioning via transforms, so it must not be inside a flex child that would reserve layout space.

## Risks / Trade-offs

- **[Low] Clear button styling mismatch** — The Waves search bar uses a simpler style than PhotosListSearchBar. The clear button will match the Waves bar aesthetic (simple `close` icon with subtle background) rather than pixel-matching the Photos version. → Acceptable since the screens have different search bar designs.
- **[Low] Pull-to-refresh during active search** — Pull-to-refresh will re-run the current search query (not clear it). The user clears search via the clear button. → This matches user's stated preference.
