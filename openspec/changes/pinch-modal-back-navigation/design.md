## Context

The app uses Expo Router's file-based routing with a nested navigator hierarchy: Root Stack → Drawer → Tabs (Stack). The pinch/zoom photo view currently lives inside the `(tabs)` stack at `app/(drawer)/(tabs)/pinch.tsx`. Photos are viewable from five screens across three different navigator levels:

- **Inside (tabs)**: PhotosList (home), PhotosDetailsShared
- **Inside (drawer), outside (tabs)**: BookmarksList, WaveDetail
- **Outside (drawer)**: FriendDetail

All screens use `ImageView.js` which calls `router.push({ pathname: '/pinch' })`. When pushed from outside the `(tabs)` stack, Expo Router resolves `/pinch` into the `(tabs)` navigator, and `router.back()` pops within that stack — landing on the home feed instead of the originating screen.

## Goals / Non-Goals

**Goals:**
- Back button from pinch view always returns to the screen that initiated the zoom
- Works uniformly from all five entry points without special-case logic
- No changes needed in `ImageView.js` or `PinchableView.js`

**Non-Goals:**
- Changing the pinch/zoom interaction behavior itself
- Adding new photo viewing features
- Modifying the navigation structure beyond the pinch route

## Decisions

### 1. Root-level modal over other approaches

**Decision**: Move `pinch.tsx` to the root of `app/` and present it as a `fullScreenModal`.

**Alternatives considered**:
- **Duplicate pinch routes in each navigator**: Would keep back-nav correct per stack but creates maintenance burden (3+ copies of the same route)
- **Track origin and navigate explicitly**: Store origin route, use `router.navigate(origin)` on back. Error-prone — requires managing state across screens, breaks if origin data is lost
- **Move to drawer level**: Still wouldn't fix FriendDetail (which is at root level, outside drawer)

**Why modal**: A modal sits on top of the entire navigation tree. `router.back()` dismisses the modal overlay and returns to whatever was underneath — regardless of which navigator pushed it. This is the structurally correct solution.

### 2. `fullScreenModal` presentation

**Decision**: Use `presentation: 'fullScreenModal'` rather than `transparentModal` or `containedTransparentModal`.

**Rationale**: PinchableView has a solid black/dark background and its own custom header. Full-screen modal covers the screen entirely, which matches the existing visual behavior. On iOS, the slide-up animation is actually more intuitive for "zoom into detail" than the current slide-from-right push.

### 3. Disable gesture on modal

**Decision**: Set `gestureEnabled: false` on the modal screen, preserving the current behavior.

**Rationale**: The pinch/zoom view uses `ReactNativeZoomableView` for pan and zoom gestures. iOS modal swipe-to-dismiss would conflict with these gestures, causing accidental dismissals during photo interaction.

## Risks / Trade-offs

- **Animation change** → The pinch view currently slides in from the right (stack push). As a modal, it will slide up on iOS. This is a UX change but arguably more natural for a zoom view. Android behavior stays similar. **Mitigation**: Acceptable — the visual metaphor of "rising up to full view" maps well to zooming.
- **Web presentation** → `fullScreenModal` on web may behave as a regular screen push. **Mitigation**: Current web behavior is already a regular push, so no regression.
