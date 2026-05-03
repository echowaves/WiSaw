## Context

The inline comment input was introduced in the `expanded-photo-height-recalc-inline-comments` change. It replaces the modal navigation for comment input when a photo is expanded inline in the masonry grid. Four bugs were discovered during testing:

1. **Keyboard blocks input**: The input row sits at the bottom of the expanded card. When the keyboard rises, the masonry doesn't scroll to keep it visible.
2. **Send button races with blur**: Tapping the send `TouchableOpacity` causes `TextInput.onBlur` to fire first, which destroys the input before `onPress` runs.
3. **No explicit cancel**: Dismissal only happens via blur, which is invisible and conflicts with the send button.
4. **Optimistic comment lacks identity**: The optimistic comment object has no `uuid` or `updatedAt`, so it renders without author name or timestamp.

All bugs are in `renderAddCommentsRow()` inside `src/components/Photo/index.js`.

## Goals / Non-Goals

**Goals:**
- Send button reliably submits the comment
- User can explicitly cancel the input
- Optimistic comment shows author and date
- Input is scrolled into view when keyboard appears

**Non-Goals:**
- Changing the non-embedded modal-input flow
- Multiline comment input
- Reworking the optimistic comment reconciliation logic

## Decisions

### 1. Blur/send race condition — use `isSubmittingRef` guard

**Choice**: Add a `useRef` flag (`isSubmittingRef`) set to `true` at the start of the send handler. The `onBlur` handler checks this flag and skips dismissal when a submit is in progress.

**Why not `setTimeout` in onBlur?** A delay-based approach is fragile across devices and introduces visible flicker. A ref flag is synchronous and deterministic.

**Why not `onPressIn` on send?** `onPressIn` fires before blur on some platforms but the behavior is inconsistent across iOS/Android. A ref guard works reliably on both.

### 2. Cancel button — add an X icon next to the TextInput

**Choice**: Add a small close/X `TouchableOpacity` to the left of the send button, inside the input row. Tapping it clears text and hides the input. This also means `onBlur` no longer needs to auto-dismiss — only the explicit cancel button and successful submit hide the input.

**Why remove auto-dismiss on blur?** With a cancel button, blur-to-dismiss becomes a liability (it causes the send button race). The cancel button gives a clear intentional dismiss action. The keyboard can be dismissed without losing the draft — the input stays visible until cancel or submit.

### 3. Keyboard visibility — use `onRequestEnsureVisible` with a comment input ref

**Choice**: Add a ref to the inline input row. After `setShowCommentInput(true)`, measure the input's position via `measureInWindow` and call `onRequestEnsureVisible` to scroll it into view. This reuses the same scroll mechanism used by AI section toggles.

**Prerequisite**: `onRequestEnsureVisible` is not currently passed to `<Photo>` from `PhotosListMasonry.renderMasonryItem`. It needs to be threaded through.

### 4. Optimistic comment identity — add `uuid` and `updatedAt`

**Choice**: Include `uuid` (from component state) and `updatedAt: new Date().toISOString()` in the optimistic comment object. The `friendsHelper.getLocalContactName` call will then resolve the current user's display name, and `renderDateTime` will show a valid timestamp.

## Risks / Trade-offs

- **Keeping input visible on blur**: If the user taps elsewhere in the expanded card (e.g., another button), the input stays open. This is acceptable because the cancel button provides an explicit close action, and the keyboard dismisses on outside tap anyway.
- **onRequestEnsureVisible threading**: Requires adding the prop to `PhotosListMasonry` → `Photo`. Minor plumbing but adds a prop to the masonry render path.
