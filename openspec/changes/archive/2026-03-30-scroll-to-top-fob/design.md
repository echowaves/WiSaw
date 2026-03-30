## Context

Three screens (PhotosList, BookmarksList, WaveDetail) share `PhotosListMasonry`, which renders an `ExpoMasonryLayout` — a scrollable masonry grid. Scroll position is already tracked in `usePhotoExpansion` via `lastScrollY.current`, and the masonry exposes `scrollToOffset`/`scrollTo` through `masonryRef`. A `SearchFab` component already exists as a Reanimated-driven floating button positioned bottom-left; this new FOB occupies the opposite corner (top-right) with no overlap.

## Goals / Non-Goals

**Goals:**
- Provide a contextual scroll-to-top shortcut on all masonry feed screens.
- Auto-show on downward scroll past 200px, auto-hide after 3s inactivity.
- Slide-right dismiss animation for a polished feel.
- Zero per-screen wiring — lives entirely inside `PhotosListMasonry`.

**Non-Goals:**
- Gesture-based dismissal (swipe-to-dismiss). Auto-hide and tap are sufficient.
- Appearing on upward scroll. Only downward scroll past threshold triggers it.
- Coordinating visibility with `SearchFab`. They occupy different corners.

## Decisions

### 1. FOB lives inside PhotosListMasonry, not as a per-screen sibling

**Choice**: Wrap `ExpoMasonryLayout` in a `<View style={{ flex: 1 }}>` container inside `PhotosListMasonry` and render the FOB as an absolutely-positioned overlay sibling.

**Why**: All three screens pass `onScroll` and `masonryRef` through `PhotosListMasonry`. Placing the FOB here means zero changes in PhotosList, BookmarksList, or WaveDetail. The component already has everything it needs.

**Alternative**: Add the FOB as a sibling in each screen alongside `SearchFab`. Rejected because it triples the integration work with no benefit.

### 2. Scroll-direction detection via ref diffing, not Reanimated scroll handler

**Choice**: Track `prevScrollY` in a plain ref inside `PhotosListMasonry`. Compare with current `contentOffset.y` in the existing `onScroll` callback. Drive a `showFob` boolean state that the FOB component reads.

**Why**: The masonry's `onScroll` is a plain JS callback (not a Reanimated worklet). Adding a Reanimated `useAnimatedScrollHandler` would require the masonry to accept an animated scroll handler — unnecessary complexity for a simple threshold check.

**Alternative**: Reanimated `useAnimatedScrollHandler` for worklet-based scroll tracking. Rejected — `ExpoMasonryLayout` doesn't expose an animated scroll ref, and the existing JS `onScroll` is sufficient at 16ms throttle.

### 3. FOB component uses Reanimated for enter/exit animation only

**Choice**: The FOB receives a `visible` prop. Internally it drives a `translateX` shared value (0 ↔ +80) with `withSpring` for enter and `withTiming` for exit. The 3s inactivity timer lives in the parent (`PhotosListMasonry`), not in the FOB.

**Why**: Keeps the FOB component pure — it animates based on a prop. The timer logic belongs with the scroll tracking that drives it.

### 4. Button sizing: 40px (smaller than SearchFab's 56px)

**Choice**: 40×40 circle with `Ionicons chevron-up`, using `theme.HEADER_BACKGROUND` background and `theme.TEXT_SECONDARY` icon color.

**Why**: This is a utility shortcut, not a primary action. Muted styling prevents it from competing with the SearchFab visually. Matches the app's existing theme system.

### 5. Scroll-to-top action uses existing masonryRef

**Choice**: On tap, call `masonryRef.current.scrollToOffset({ offset: 0, animated: true })`. Then hide the FOB immediately (don't wait for scroll to finish).

**Why**: `masonryRef` is already passed through to `PhotosListMasonry`. The `performScroll` helper in `usePhotoExpansion` shows this API is reliable. Hiding immediately on tap feels more responsive than waiting.

## Risks / Trade-offs

- **ExpoMasonryLayout wrapper View** → Adding a wrapper `<View>` around the masonry could theoretically affect flex layout. Mitigation: use `style={{ flex: 1 }}` to preserve existing behavior. Low risk — standard React Native pattern.

- **Timer cleanup on unmount** → The 3s `setTimeout` must be cleared on unmount and on each scroll event that resets it. Mitigation: store timer ID in a ref, clear in cleanup. Standard pattern.

- **Scroll direction jitter** → Small scroll deltas (1-2px) could cause rapid show/hide. Mitigation: require a minimum delta threshold (e.g., delta > 5) before considering it a "downward scroll" event.
