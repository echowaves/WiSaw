## Context

The inline comment input in `src/components/Photo/index.js` renders a `TextInput` alongside a `TouchableOpacity` send button inside a `flexDirection: 'row'` container. On iOS, when the `TextInput` is focused (keyboard visible), tapping the send button causes the `TextInput` to blur first, which dismisses the keyboard and triggers a layout shift. The `onPress` event on `TouchableOpacity` never fires because the touch target moved during the gesture.

The `onSubmitEditing` handler (keyboard's Send/Return key) works correctly because it's a keyboard event, not a touch event on a separate element.

The existing spec (`openspec/specs/inline-comment-input/spec.md`) already defines the "Send button tap does not race with blur" scenario — the implementation simply doesn't match.

## Goals / Non-Goals

**Goals:**
- Send button submits the comment on the first tap, dismissing the keyboard and submitting atomically
- No double-tap required
- No visual flicker or layout issues

**Non-Goals:**
- Changing the modal comment input (separate code path, works correctly)
- Refactoring the duplicate submit logic (cosmetic, out of scope)

## Decisions

### Use `onTouchStart` with guard flag instead of `onPress`

The `onTouchStart` event fires before the `TextInput` blur propagates, so it captures the user's intent before the layout shift cancels the gesture.

```
Current flow (broken):
  Touch → TextInput blur → keyboard dismiss → layout shift → onPress lost
  
Fixed flow:
  Touch → onTouchStart fires → submit starts → keyboard dismiss → layout shift
```

The existing `isSubmittingCommentRef.current` flag already guards against double submissions, which also protects against the `onTouchStart` firing multiple times (touch start + potential subsequent events).

**Alternatives considered:**
- `onStartShouldSetResponder` on the button — more verbose, returns boolean, less idiomatic for this simple case
- Wrapping in `ScrollView` with `keyboardShouldPersistTaps='handled'` — structural change, may affect masonry layout behavior
- Extracting submit logic to a shared function — good hygiene but orthogonal to the fix

## Risks / Trade-offs

- [Risk] `onTouchStart` can fire even if the finger lifts outside the button bounds → Mitigated by `isSubmittingCommentRef.current` guard and the empty text check (`!commentInputText.trim()`)
- [Risk] Android behavior may differ — iOS is the primary affected platform, but `onTouchStart` is cross-platform safe
