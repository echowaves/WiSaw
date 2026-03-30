## 1. Create ScrollToTopFob Component

- [x] 1.1 Create `src/components/ScrollToTopFob/index.js` with a Reanimated-driven 40×40 circle button. Accept props: `visible` (boolean), `onPress` (callback), `theme` (object). Use `useSharedValue` for `translateX` (0 ↔ +80) and `opacity` (0 ↔ 1). Enter with `withSpring({ damping: 18, stiffness: 120 })`, exit with `withTiming(200ms)`. Render `Ionicons chevron-up` (size 20, `theme.TEXT_SECONDARY`). Background `theme.HEADER_BACKGROUND`, subtle shadow. Position `absolute`, `top: 12`, `right: 12`. Disable pointer events when hidden.

## 2. Integrate FOB into PhotosListMasonry

- [x] 2.1 In `PhotosListMasonry`, add scroll-direction tracking: a `prevScrollY` ref and `showFob` state. In the `onScroll` handler, compute delta, set `showFob = true` when `contentOffset.y > 200` and `delta > 5` (downward). Set `showFob = false` when `contentOffset.y <= 200`. Forward the event to the parent's `onScroll` unchanged.
- [x] 2.2 Add a 3-second inactivity timer via a ref. Each qualifying scroll event clears and restarts the timer. When the timer fires, set `showFob = false`. Clear the timer on unmount.
- [x] 2.3 Wrap `ExpoMasonryLayout` in a `<View style={{ flex: 1 }}>` container. Render `<ScrollToTopFob visible={showFob} onPress={handleScrollToTop} theme={theme} />` as a sibling inside the wrapper. The `handleScrollToTop` callback calls `masonryRef.current.scrollToOffset({ offset: 0, animated: true })` and sets `showFob = false`.
- [x] 2.4 Add `theme` to the `PhotosListMasonry` props (passed from parent via `useContext(ThemeContext)`). Verify it is already available or thread it through.

## 3. Verify

- [x] 3.1 Open the home feed, scroll down past ~200px, confirm the FOB appears in the upper-right corner with slide-in animation. Stop scrolling — confirm it disappears after ~3 seconds by sliding right. Tap it while visible — confirm smooth scroll to top and FOB hides immediately.
- [x] 3.2 Open the Bookmarks screen with enough content to scroll. Confirm the same FOB behavior.
- [x] 3.3 Open a Wave detail screen with enough content to scroll. Confirm the same FOB behavior.
