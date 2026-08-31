# Tasks: Preview Tap Expand Photo

## 1. Modal: make preview image tappable

- [x] 1.1 `src/components/QuickActionsModal/index.js`: add `onPhotoSelect` prop (PropTypes: `func`)
- [x] 1.2 Extract a `handlePreviewPress` callback: fire `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` (matching `ExpandableThumb`), then call `onPhotoSelect(photo)` when provided; early-return otherwise
- [x] 1.3 Replace the `thumbnailContainer` `View` with `TouchableOpacity` (`onPress={handlePreviewPress}`, `activeOpacity={0.85}`), keeping the existing `styles.thumbnailContainer` styling and both `CachedImage` layers + `ActivityIndicator` fallback as children — no layout changes
- [x] 1.4 Verify the outer content `TouchableOpacity` remains pressless (no `onPress`) and the backdrop `onPress={onClose}` is untouched

## 2. Wrapper: forward the select callback

- [x] 2.1 `src/components/QuickActionsModalWrapper/index.js`: accept `onPhotoSelect` prop and pass it through to `QuickActionsModal`
- [x] 2.2 Forward handler mirrors the existing `onPhotoDeleted` pattern: `setLongPressPhoto(null)` first, then `onPhotoSelect(photo)` — modal must be closed before expansion starts
- [x] 2.3 Confirm the `memo`/`forwardRef` surface is otherwise unchanged (no new internal state)

## 3. Screen wiring (all three feeds)

- [x] 3.1 `src/screens/PhotosList/index.js`: add `handlePreviewSelect` `useCallback` — guard `photosList.some((p) => p.id === photo.id)`, then `toggleExpand(photo.id)`; stale id → silent no-op; pass as `onPhotoSelect` to both `QuickActionsModalWrapper` instances (main feed + loading-state branch)
- [x] 3.2 `src/screens/WaveDetail/index.js`: same `useCallback` handler (deps: `photosList`, `toggleExpand`), pass to its `QuickActionsModalWrapper`
- [x] 3.3 `src/screens/FriendDetail/index.js`: same `useCallback` handler, pass to its `QuickActionsModalWrapper`
- [x] 3.4 Keep every handler's cyclomatic complexity ≤ 8 (single guard + single call — trivially satisfied; extract only if something grows)

## 4. Verification (manual, user-run)

- [x] 4.1 Main feed: long-press a photo → tap preview image → modal closes, photo expands inline full-width, auto-scrolls near top (8px offset), floating X collapses it
- [x] 4.2 Wave detail + friend feed: repeat 4.1 in each feed
- [x] 4.3 Tap the dimmed backdrop (not the image) → modal closes, no expansion
- [x] 4.4 Action buttons still behave normally (Report/Delete/Bookmark/Wave/Share) — no accidental expand
- [x] 4.5 Tap preview image while a *different* photo is already expanded → old collapses, tapped photo expands
- [x] 4.6 Video post: tap poster preview → closes and expands the inline video player
- [x] 4.7 No valid image URLs (spinner-only preview) → tap still closes and expands
- [x] 4.8 Stale-id race: open modal, force a feed reload that removes the photo (or delete it), tap preview → modal closes, feed unchanged
- [x] 4.9 Expand with search FAB open → auto-scroll still lands correctly
- [x] 4.10 Long-press open path and ⋮ pill open path both reach the same tappable preview
