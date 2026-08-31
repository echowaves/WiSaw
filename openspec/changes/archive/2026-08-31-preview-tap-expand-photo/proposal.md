# Proposal: Preview Tap Expand Photo

## Why

When a user long-presses a photo thumbnail (or taps the ⋮ pill) to open the quick-actions preview overlay, there is no way to view that photo in the feed without manually closing the overlay, then re-finding the photo in the masonry grid and tapping its thumbnail. The preview already shows the full-resolution image, so tapping it should feel like a direct continuation: close the overlay and expand the photo inline in the feed where the user can see it in context.

## What Changes

- The photo preview image area inside the quick-actions modal (`QuickActionsModal`) becomes tappable. Tapping it closes the overlay AND expands the tapped photo inline in the host feed (full-width `<Photo embedded>` card via the existing `usePhotoExpansion.toggleExpand`), with the masonry's existing auto-scroll bringing it into view.
- Tap target is the photo image only (the progressive two-layer `CachedImage` container). The action buttons, close button, and the dimmed backdrop keep their current behavior (backdrop tap closes without expanding).
- A new `onPhotoSelect(photo)` callback is threaded through `QuickActionsModalWrapper` so each host screen can map the tapped photo to its own `toggleExpand` — all three feed screens (main feed `PhotosList`, `WaveDetail`, `FriendDetail`) are wired, so behavior is consistent across feeds.
- Expand is triggered immediately in the same handler as the close (the masonry animates behind the fading modal); no pending-expand state or `onDismiss` sequencing is introduced.
- Stale-photo guard: if the photo is no longer present in the host screen's feed list (e.g., feed reloaded or photo deleted elsewhere), the overlay still closes but no expansion is attempted.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `quick-actions-modal`: New requirement — tapping the photo preview image closes the overlay and expands that photo inline in the host feed (image-area tap only; backdrop and action-button behavior unchanged).

## Impact

- **Code**:
  - `src/components/QuickActionsModal/index.js` — make the preview image container pressable, add `onPhotoSelect` prop, fire haptic + callback.
  - `src/components/QuickActionsModalWrapper/index.js` — accept and forward `onPhotoSelect`, close state before invoking it.
  - `src/screens/PhotosList/index.js`, `src/screens/WaveDetail/index.js`, `src/screens/FriendDetail/index.js` — pass `onPhotoSelect` handlers that guard against stale ids and call the existing `toggleExpand`.
- **Dependencies**: none new.
- **Backend**: none.
- **UX**: One extra path to the inline expanded photo from the long-press preview, in all three feeds.
