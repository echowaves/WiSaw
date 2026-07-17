## Context

The PhotosList screen renders `PhotosListMasonry` (scrollable photo grid) and `SearchFab` (floating search bar) as siblings under a flex container. When the FAB expands and the keyboard appears, `SearchFab` animates upward via `useReanimatedKeyboardAnimation` from `react-native-keyboard-controller`, but the masonry layout has a static `contentPaddingBottom` (~178px) so photos flow under the keyboard.

The search TextInput currently submits on both FAB button press AND keyboard Return key via `onSubmitEditing`.

## Goals / Non-Goals

**Goals:**
- Masonry bottom padding grows dynamically when keyboard opens, pushing content above the keyboard
- Search only submits via FAB send button tap, not Return key

**Non-Goals:**
- Live search filtering as user types
- Changing FAB keyboard animation behavior
- Comment input keyboard handling (already uses `isCommentEditing` to hide FAB)

## Decisions

### Decision 1: Track keyboard height in PhotosList screen, pass to masonry

Rather than wrapping the masonry in a `KeyboardAvoidingView`, we track keyboard state in `PhotosList` and compute a dynamic `contentPaddingBottom`. The masonry's internal `ExpoMasonryLayout` already respects `contentPaddingBottom` as part of `contentContainerStyle`.

**Why over KeyboardAvoidingView:** `KeyboardAvoidingView` can conflict with nested scrollviews (masonry is FlatList-based). A padding-based approach is surgical and predictable.

**Implementation:**
- Use `useState` with `Keyboard.addListener` events (`keyboardWillShow`, `keyboardWillHide`) to track keyboard height
- Compute `effectivePadding = FOOTER_HEIGHT + 56 + 32 + keyboardHeight`
- Pass as `contentPaddingBottom` to `PhotosListMasonry`
- On unmount, remove listeners

### Decision 2: Remove `onSubmitEditing` from SearchFab TextInput

Replace `onSubmitEditing` with a no-op that only dismisses the keyboard. Change `returnKeyType` from `'search'` to `'done'` to signal the key dismisses rather than submits.

**Why:** Users expect the FAB button to be the explicit action. The Return key is a convenience that can trigger unexpected searches mid-typing.

## Risks / Trade-offs

- **Keyboard events on Android:** Android keyboard events may behave differently (no `keyboardWillShow`, uses `keyboardDidShow`). Mitigation: use both `Will` and `Did` events, or test on Android emulator.
- **Masonry re-render on padding change:** The `contentPaddingBottom` change triggers a re-render of `ExpoMasonryLayout`. This is a style-only change and should be cheap, but worth monitoring for jank on lower-end devices.
- **Expanded photo during keyboard:** If a photo is expanded when keyboard opens, the padding adjustment still applies. This is acceptable — the expanded photo is part of the masonry scroll.
