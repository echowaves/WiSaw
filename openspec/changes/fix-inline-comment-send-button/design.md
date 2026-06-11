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

### Use `onTouchStart` flag + `onBlur` submit pattern

The `onTouchStart` event fires before the `TextInput` blur, so it reliably sets a flag. The actual submission happens in the `TextInput`'s `onBlur` handler, which always fires when the keyboard dismisses.

```
Current flow (broken):
  Touch → TextInput blur → keyboard dismiss → layout shift → onPress lost

Fixed flow:
  Touch → onTouchStart sets flag → blur fires → onBlur sees flag → submits
```

Two refs track intent:
- `sendTappedRef` — set by `onTouchStart` on send button, checked/reset in `onBlur`
- `cancelTappedRef` — set by cancel button `onPress`, checked in `onBlur` to skip submission

This prevents `onBlur` from submitting on random taps outside the input, while still catching the send button tap even when `onPress` is cancelled.

**Alternatives considered:**
- `onStartShouldSetResponder` — claimed the gesture but keyboard dismiss still caused layout shift, cancelling `onPress`
- `onTouchStart` with direct submit — `e.preventDefault()` is meaningless in RN, and direct submit in `onTouchStart` still races with blur
- `ScrollView` with `keyboardShouldPersistTaps='handled'` — structural change, `ExpoMasonryLayout` doesn't expose this prop

## Risks / Trade-offs

- [Risk] `onTouchStart` can fire even if the finger lifts outside the button bounds → Mitigated by `isSubmittingCommentRef.current` guard and the empty text check (`!commentInputText.trim()`)
- [Risk] Android behavior may differ — iOS is the primary affected platform, but `onTouchStart` is cross-platform safe
