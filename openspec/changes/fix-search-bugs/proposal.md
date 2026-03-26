## Why

Three search UX bugs degrade usability across Waves and Photos screens: the Waves search bar lacks a clear button, an empty Waves search result leaves the user stranded with no way to recover, and the Photos search results render with a misplaced search bar and a gap at the top of the list.

## What Changes

- Add a clear (`✕`) button to the Waves search input that appears when text is entered, matching the Photos search pattern
- Always show the Waves search bar when a search term is active (not only when `waves.length > 0`), and display a search-aware empty state ("No Results Found" / "Clear Search") instead of the generic "No Waves Yet" message
- Move the `PhotosListSearchBar` in the results branch to be a sibling of `PhotosListFooter` (outside the flex container) so `KeyboardStickyView` does not reserve layout space inside the masonry content area

## Capabilities

### New Capabilities

_None_

### Modified Capabilities

- `wave-hub`: Search bar visibility and empty state behavior when search yields no results; clear button on search input
- `photo-feed`: Search bar layout position in the results render branch to eliminate gap

## Impact

- `src/screens/WavesHub/index.js` — search bar rendering logic, empty state, clear button
- `src/screens/PhotosList/index.js` — search bar placement in the `photosList.length > 0` branch
