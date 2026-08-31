# Design: Preview Tap Expand Photo

## Context

- `QuickActionsModal` (`src/components/QuickActionsModal/index.js`) is a native RN `Modal` (fade) opened from `QuickActionsModalWrapper` via `quickActionsRef.current.open(photo)` on long-press / ⋮ pill. Its content is a `TouchableOpacity` with **no** `onPress`, so taps inside the card are currently absorbed and do nothing.
- The preview image is the `thumbnailContainer` `View` holding two absolutely-positioned `CachedImage` layers (thumb zIndex 1, full-res zIndex 2) and, when no valid URLs exist, an `ActivityIndicator`.
- All three host screens already own `usePhotoExpansion()` (`toggleExpand`, `expandedItemIds`, `getExpandedHeight`, `masonryRef`) and already render `PhotosListMasonry` with `autoScrollOnExpand` + single-expansion invariant. Each also has a `photosList` state array.
- The wrapper (`QuickActionsModalWrapper`) already closes itself before forwarding `onPhotoDeleted` / `onPhotoRemovedFromWave` — the same pattern is reused here.

## Goals / Non-Goals

**Goals:**
- Tap on the preview image closes the overlay and expands the tapped photo inline in the host feed, consistently in all three feeds (main, wave detail, friend detail).
- Reuse the existing expansion + auto-scroll pipeline; no new navigation, no new state machines.
- Keep the tap target strictly on the image area so action buttons and backdrop behavior are untouched.

**Non-Goals:**
- No new "pending expansion" state or `onDismiss`-keyed sequencing.
- No changes to `usePhotoExpansion`, `PhotosListMasonry`, or the `inline-expand` capability.
- No change to how the modal is opened (long-press / ⋮ pill unchanged).
- No pinch/zoom navigation (`/pinch`) from the modal — out of scope.

## Decisions

### D1: Immediate expand in the same handler as close (not `onDismiss`)
The wrapper's close path and the screen's `toggleExpand` are both plain state setters; calling them in the same handler means the masonry expansion animates while the modal fade-out finishes. Alternative considered: store a "pending expand" photo and expand from the RN `Modal onDismiss` callback for a strictly sequential visual. Rejected because `onDismiss` timing is platform-variable, it needs an extra ref + cleanup to avoid stale expansions, and the overlap (fade ≈200ms vs masonry spring) is visually acceptable — the expansion is the focus of attention.

### D2: Tap target = the `thumbnailContainer` only
The image container becomes a `TouchableOpacity` (activeOpacity ~0.85, light haptic matching the thumb-tap pattern in `ExpandableThumb`). The container already has fixed bounds (`width: 100%`, `aspectRatio: 1`, `overflow: hidden`), so hit-slopping is trivial and the `ActivityIndicator` fallback case (no valid URLs) is also tappable, which is desired. The outer content `TouchableOpacity` stays pressless, so taps on padding/gaps between sections still do nothing, and the backdrop `onPress={onClose}` is untouched.

### D3: Callback shape — `onPhotoSelect(photo)` on the modal, forwarded by the wrapper
- `QuickActionsModal` gains `onPhotoSelect` prop; image tap handler fires haptic, then `onPhotoSelect(photo)`.
- `QuickActionsModalWrapper` gains `onPhotoSelect` prop; on tap it does `setLongPressPhoto(null)` then `onPhotoSelect(photo)` — identical ordering to the existing `onPhotoDeleted` path, so the modal is never open on top of a freshly expanded card.
- The wrapper's `memo`/`forwardRef` surface is unchanged otherwise; screens pass `onPhotoSelect` as a stable `useCallback` so the memo keeps working (it already re-renders only when its own state changes today).

### D4: Stale-id guard lives in the screen, not the modal
Each screen's handler checks `photosList.some((p) => p.id === photo.id)` before calling `toggleExpand(photo.id)`. The modal stays dumb (no feed knowledge). Rationale: the screen owns both `photosList` and `toggleExpand`; keeping the guard there means the modal has zero coupling to feed state and the guard logic is one line per screen. If the id is stale, the overlay simply closes (no toast — this is a rare race, silent no-op matches the "tap outside" dismissal feel).

### D5: All three screens wired in the same change
Main feed (`PhotosList`), `WaveDetail`, and `FriendDetail` each get the one-liner `onPhotoSelect` handler. Partial wiring would create feed-to-feed inconsistency for a behavior users can't predict; the marginal cost is ~3 lines per screen.

## Risks / Trade-offs

- **Overlapping animations** (D1): modal fade + masonry spring run concurrently. Acceptable; if it looks muddy in manual testing, the fallback is D1's alternative (onDismiss sequencing) — a localized change in the wrapper.
- **`TouchableOpacity` inside a nested `TouchableOpacity`**: the content card is a pressless `TouchableOpacity` (no `onPress`), so there is no gesture conflict; the image button's presses resolve to the innermost pressable. Verified against the current JSX structure.
- **Expand while keyboard/search FAB is open**: expansion auto-scroll already accounts for keyboard top via the existing `onRequestEnsureVisible`/auto-scroll machinery; no new interaction, but worth a manual check with the search FAB expanded.
- **Video posts**: tapping the poster preview expands the inline video player (correct by design; flagged in the spec as a scenario).
