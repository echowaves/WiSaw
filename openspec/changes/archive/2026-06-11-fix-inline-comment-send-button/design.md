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

### Use `onBlur` to trigger submission

When the `TextInput` is focused (keyboard visible) and the user taps the send button, the `TextInput` loses focus which triggers the `onBlur` event. The `onBlur` handler checks if the text is non-empty and if the cancel button was not tapped, then submits the comment and dismisses the keyboard.

```
Current flow (broken):
  Touch → TextInput blur → keyboard dismiss → layout shift → onPress lost (requires second tap)

Fixed flow:
  Touch → TextInput blur → onBlur fires → check guards → submit → keyboard dismiss
```

A single `cancelTappedRef` tracks intent:
- `cancelTappedRef` — set by cancel button `onPress`, checked in `onBlur` to skip submission
- No `sendTappedRef` needed because any blur with non-empty text and no cancel triggers submission

This approach works because on iOS the keyboard overlay intercepts touch events at the native level, preventing `onPress` from firing on the send button. However, the `TextInput`'s `onBlur` always fires reliably when focus is lost.

**Why this works:**
- `onBlur` fires on the TextInput regardless of what view receives the tap
- The empty text check (`!commentInputText.trim()`) prevents submitting empty comments
- `isSubmittingCommentRef.current` guard prevents duplicate submissions during async
- `cancelTappedRef` prevents accidental submission when user cancels instead

**Alternatives considered:**
- `onStartShouldSetResponder` — claimed the gesture but keyboard dismiss still caused layout shift, cancelling `onPress`
- `onTouchStart` with direct submit or flag — did not work on iOS due to keyboard intercepting touches
- `ScrollView` with `keyboardShouldPersistTaps='handled'` — structural change, `ExpoMasonryLayout` doesn't expose this prop

## Risks / Trade-offs

- [Risk] `onTouchStart` can fire even if the finger lifts outside the button bounds → Mitigated by `isSubmittingCommentRef.current` guard and the empty text check (`!commentInputText.trim()`)
- [Risk] Android behavior may differ — iOS is the primary affected platform, but `onTouchStart` is cross-platform safe
