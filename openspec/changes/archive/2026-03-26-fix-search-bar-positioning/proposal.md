## Why

The search bars on both the Photos and Waves screens have positioning bugs introduced by incorrect `KeyboardStickyView` offset values. The Photos search bar is completely invisible when the keyboard is closed because the `closed: 94` offset translates it 94px below the screen edge. The Waves search bar appears too close to the bottom edge, overlapping the home indicator on notched devices because `closed: 4` provides insufficient clearance.

## What Changes

- Fix the Photos search bar `KeyboardStickyView` offset so the bar is always visible above the footer when the keyboard is closed, and follows the keyboard when open
- Fix the Photos search bar visibility on the empty search results screen (same root cause)
- Increase the Waves search bar bottom clearance using `useSafeAreaInsets().bottom` so it respects the device safe area and maintains a meaningful gap from the screen edge

## Capabilities

### New Capabilities

_None_

### Modified Capabilities

- `photo-feed`: Fix `PhotosListSearchBar` `KeyboardStickyView` offset so the search bar is visible when keyboard is closed
- `wave-hub`: Fix waves search bar `KeyboardStickyView` offset to use safe area insets for proper bottom clearance

## Impact

- `src/screens/PhotosList/components/PhotosListSearchBar.js` — offset value change
- `src/screens/PhotosList/components/PhotosListEmptyState.js` — may need same fix
- `src/screens/WavesHub/index.js` — import `useSafeAreaInsets`, update offset to use `insets.bottom`
