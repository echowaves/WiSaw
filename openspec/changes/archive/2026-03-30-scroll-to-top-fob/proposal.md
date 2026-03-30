## Why

When users scroll deep into a photo feed, there's no quick way to return to the top. They must manually scroll back through all content. A floating "scroll to top" button provides a standard, ergonomic shortcut that appears contextually during downward scrolling and auto-dismisses to stay out of the way.

## What Changes

- Add a small floating button (FOB) that appears in the upper-right corner of the masonry layout when the user scrolls down past 200px.
- Tapping the FOB smoothly scrolls the feed to the top.
- The FOB auto-dismisses by sliding right off-screen after 3 seconds of scroll inactivity.
- The FOB reappears on the next downward scroll past the threshold.
- The FOB lives inside `PhotosListMasonry` so all three masonry-based screens (PhotosList, BookmarksList, WaveDetail) get it automatically with no per-screen wiring.

## Capabilities

### New Capabilities
- `scroll-to-top-fob`: Floating overlay button inside the masonry layout that appears on downward scroll past a threshold, scrolls the list to top on tap, and auto-hides after inactivity by sliding off the right edge.

### Modified Capabilities
- `photo-feed`: PhotosListMasonry gains internal scroll-direction tracking and renders the FOB overlay. The existing `onScroll` forwarding to the parent is preserved.

## Impact

- `src/screens/PhotosList/components/PhotosListMasonry.js` — wraps `ExpoMasonryLayout` in a container, adds scroll-direction tracking, renders the new FOB component.
- New component file `src/components/ScrollToTopFob/index.js` — Reanimated-driven animated button.
- No new dependencies — uses existing `react-native-reanimated` and `@expo/vector-icons` (Ionicons).
- No API or backend changes.
- All three masonry screens (PhotosList, BookmarksList, WaveDetail) gain the behavior automatically.
