## Why

Three search UX bugs degrade usability across Waves and Photos screens: the Waves search bar lacks a clear button, an empty Waves search result leaves the user stranded with no way to recover, and the Photos search results render with a misplaced search bar and a gap at the top of the list. Additionally, both search bars should be positioned at the bottom of their respective screens for consistency and ergonomics.

## What Changes

- Add a clear (`✕`) button to the Waves search input that appears when text is entered
- Move the Waves search bar from the top to the bottom of the screen, wrapped in `KeyboardStickyView`, removing the search icon (auto-submits via debounce)
- Always show the Waves search bar when a search term is active (not only when `waves.length > 0`), and display a search-aware empty state ("No Results Found" / "Clear Search") instead of the generic "No Waves Yet" message
- Fix the Photos search bar layout in the results branch by moving both `PhotosListSearchBar` and `PhotosListFooter` to the outer View level (outside the flex container) so `KeyboardStickyView` operates at screen level

## Capabilities

### New Capabilities

_None_

### Modified Capabilities

- `wave-hub`: Search bar position (top → bottom), visibility, empty state behavior, clear button, removal of search icon
- `photo-feed`: Search bar and footer layout in the results render branch

## Impact

- `src/screens/WavesHub/index.js` — search bar rendering, position, imports, styles, empty state
- `src/screens/PhotosList/index.js` — search bar and footer placement in the `photosList.length > 0` branch
