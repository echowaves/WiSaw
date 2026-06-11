## Why

The inline comment send button requires two taps to submit when the keyboard is visible — the first tap only dismisses the keyboard, the second tap actually submits the comment. This is caused by a React Native touch event race condition: tapping the `TouchableOpacity` send button first triggers the focused `TextInput` to blur (dismissing the keyboard), which causes a layout shift that cancels the touch gesture before `onPress` fires.

## What Changes

- Fix the inline comment send button in `src/components/Photo/index.js` to submit on the first tap, matching user expectation and the existing spec requirement ("Send button tap does not race with blur").

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `inline-comment-input`: The existing spec already defines the "Send button tap does not race with blur" scenario. This change fixes the implementation to match the spec. A delta spec will document the bug and verify the fix.

## Impact

- `src/components/Photo/index.js` — single component change to the send button's touch handling
- No API, data model, or navigation changes
