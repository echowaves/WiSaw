## 1. Fix inline send button touch handling

- [x] 1.1 Use `onStartShouldSetResponder` to claim gesture before TextInput blur
- [x] 1.2 Call `Keyboard.dismiss()` in `onResponderGrant` to dismiss keyboard before blur
- [x] 1.3 Move submit logic to `onPress` which will fire reliably after gesture is claimed

## 2. Verify

- [ ] 2.1 Test on iOS: type a comment, tap send button — keyboard dismisses and comment submits on first tap
- [ ] 2.2 Test on Android: same flow confirms cross-platform correctness
- [x] 2.3 Verify keyboard "Send" key (`onSubmitEditing`) still works unchanged
- [x] 2.4 Verify empty text guard (send button disabled/opacity 0.4) still prevents submission
