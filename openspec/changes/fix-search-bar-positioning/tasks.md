## 1. Photos Search Bar Offset Fix

- [x] 1.1 In `PhotosListSearchBar.js`, change the `KeyboardStickyView` `closed` offset from `FOOTER_HEIGHT + FOOTER_GAP` (positive 94) to `-(FOOTER_HEIGHT + FOOTER_GAP)` (negative 94) so the search bar translates upward above the footer when the keyboard is closed.
- [x] 1.2 Verify the search bar in `PhotosListEmptyState.js` uses the same `PhotosListSearchBar` component (no separate offset override needed).

## 2. Waves Search Bar Safe Area Fix

- [x] 2.1 In `WavesHub/index.js`, import `useSafeAreaInsets` from `react-native-safe-area-context` and call it to get `insets.bottom`.
- [x] 2.2 Change the `KeyboardStickyView` `closed` offset from `4` to `-(insets.bottom + 8)` so the search bar clears the device safe area with an 8px gap.
