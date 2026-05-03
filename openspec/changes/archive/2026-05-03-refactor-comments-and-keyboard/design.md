## Context

The Photo component renders inline comment input when `embedded === true`. Today it uses an optimistic UI pattern: a fake comment object is injected into state immediately, then a delayed refetch replaces it. The keyboard scroll relies on a 300ms setTimeout and `measureInWindow` which returns the full container height, ignoring keyboard occlusion.

## Goals / Non-Goals

**Goals:**
- Comment submission returns the real backend object and appends it to local state — no optimistic fake needed.
- Keyboard scroll uses the native `keyboardDidShow` event to get exact viewport boundaries.
- No flash/flicker during comment addition (no `setPhotoDetails(null)` mid-flow).

**Non-Goals:**
- Refactoring the entire masonry scroll system.
- Adding `KeyboardAvoidingView` to the masonry (would conflict with custom scroll logic).
- Changing the non-embedded (modal) comment flow.

## Decisions

### 1. Return real comment from `submitComment`

Update the GraphQL mutation selection set to include `updatedAt` and `uuid`. Return the comment object with `hiddenButtons: true` appended client-side. The caller appends it directly to `photoDetails.comments`.

**Why not just refetch?** The mutation response already has the data. An extra round-trip adds latency for no benefit. We still emit `photoRefreshBus` for other screens, but the originating component updates instantly from the mutation response.

### 2. Use `Keyboard.addListener('keyboardDidShow')` for scroll

When `setShowCommentInput(true)` is called, register a one-shot `keyboardDidShow` listener. Inside the callback:
- `commentInputRef.measureInWindow()` gives the input's screen Y.
- `e.endCoordinates.screenY` gives the keyboard's top edge.
- If the input bottom exceeds the keyboard top, call `onRequestEnsureVisible` with the `keyboardTop` value.

Update `PhotosListMasonry`'s `onRequestEnsureVisible` callback to use `keyboardTop` (when provided) instead of `my + mh` as the viewport bottom.

### 3. Remove all optimistic comment machinery

Remove: `optimisticComment` state, `setOptimisticComment`, `global.photoOptimisticCallbacks`, the 1500ms delay, the `setPhotoDetails(null)` blank, and the text-matching cleanup logic.

## Risks / Trade-offs

**[Slightly slower perceived response on slow networks]** → The comment won't appear until the mutation response returns (typically < 500ms). The send button can show a brief disabled/loading state. This is more honest than showing a fake comment that renders incorrectly.

**[Keyboard event timing on Android]** → `keyboardDidShow` fires reliably on both platforms but with slightly different timing. The one-shot pattern (listen, fire, remove) avoids stale listener issues. If the keyboard is already visible (e.g. user re-focuses), the listener won't fire — but the input is already visible in that case, so no scroll is needed.
