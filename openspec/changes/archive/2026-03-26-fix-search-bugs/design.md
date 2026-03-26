## Context

WavesHub renders a plain `TextInput` search bar at the top, conditionally (`waves.length > 0`). PhotosList renders `PhotosListSearchBar` (a `KeyboardStickyView`-wrapped floating bar) inside a flex container in the results branch, but outside it in the empty/default branches. These inconsistencies cause three visible bugs: missing clear button, dead-end on empty search, and a gap at the top of photo search results.

Relevant files:
- `src/screens/WavesHub/index.js` — waves search bar, empty state
- `src/screens/PhotosList/index.js` — search bar placement per render branch
- `src/screens/PhotosList/components/PhotosListSearchBar.js` — reference for clear button and KeyboardStickyView pattern

## Goals / Non-Goals

**Goals:**
- Add a clear button to the Waves search input
- Move the Waves search bar to the bottom of the screen using `KeyboardStickyView`
- Remove the search icon from the Waves search bar (auto-submits, no visual search affordance needed)
- Ensure the Waves search bar remains visible when a search returns zero results
- Show a search-aware empty state in Waves when search yields no results
- Fix the Photos search bar layout by moving `PhotosListSearchBar` and `PhotosListFooter` to the outer View level in the results branch

**Non-Goals:**
- Adding a submit button to the Waves search bar (Waves search auto-submits via debounce)
- Refactoring PhotosListSearchBar into a shared component for both screens
- Changing the search debounce timing or search API behavior

## Decisions

### 1. Waves search bar: move to bottom with KeyboardStickyView

Wrap the search bar in `KeyboardStickyView` from `react-native-keyboard-controller` with `offset: { closed: 4, opened: 16 }`. Render it at the end of the WavesHub component (after ActionMenu, before the closing `</View>`). Remove the search icon (`FontAwesome5 search`) since the bar auto-submits via debounce — no visual search affordance is needed.

**Why KeyboardStickyView?** It's already used for the Photos search bar and handles keyboard-following behavior. Using it for Waves ensures consistent behavior across screens.

### 2. Waves clear button: inline icon

Add a `TouchableOpacity` with `Ionicons close` icon inside the search bar `View`, positioned absolutely on the right side of the `TextInput`. Show it conditionally when `searchText` is non-empty. On press: clear `searchText` and refocus the input.

### 3. Waves search bar visibility: show when `searchText` is non-empty OR `waves.length > 0`

Change the guard to `{(waves.length > 0 || searchText.length > 0) && (`. This ensures the search bar stays visible when a search returns zero results. Do NOT show the search bar when the user has no waves and no active search.

### 4. Waves empty state: search-aware ListEmptyComponent

When `searchText` is non-empty, the `ListEmptyComponent` should render a "No Results Found" empty state with a "Clear Search" action instead of the default "No Waves Yet" / "Create a Wave" messaging.

### 5. Photos search bar: move SearchBar and Footer to outer View level in results branch

In the `photosList.length > 0` render branch, move both `PhotosListSearchBar` and `PhotosListFooter` from inside `<View style={styles.container}>` to the outer `<View style={{ flex: 1 }}>` level. This matches the default/empty-state branches where the search bar works correctly. `KeyboardStickyView` needs to be at the screen level — not inside a nested flex container — for its offset math to position correctly relative to the screen bottom.

**Why move Footer too?** The Footer uses `position: absolute, bottom: 0` which works the same at either level. Moving it out keeps it as a sibling of the search bar (consistent with the working branches) and avoids z-index conflicts.

## Risks / Trade-offs

- **[Low] Clear button styling mismatch** — The Waves search bar uses a simpler style than PhotosListSearchBar. The clear button will match the Waves bar aesthetic rather than pixel-matching the Photos version. → Acceptable since the screens have different search bar designs.
- **[Low] Pull-to-refresh during active search** — Pull-to-refresh will re-run the current search query (not clear it). The user clears search via the clear button. → Matches stated preference.
