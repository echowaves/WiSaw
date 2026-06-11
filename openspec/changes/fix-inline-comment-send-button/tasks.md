## 1. Fix inline send button touch handling

- [x] 1.1 Replace `onPress` with `onTouchStart` on the send button `TouchableOpacity` in `src/components/Photo/index.js` to capture the tap before the `TextInput` blur causes a layout shift
- [x] 1.2 Call `Keyboard.dismiss()` as the first action in the `onTouchStart` handler to dismiss the keyboard immediately before the submit begins
- [x] 1.3 Ensure the `isSubmittingCommentRef.current` guard prevents double submissions if multiple touch events fire

## 2. Verify

- [ ] 2.1 Test on iOS: type a comment, tap send button — keyboard dismisses and comment submits on first tap
- [ ] 2.2 Test on Android: same flow confirms cross-platform correctness
- [x] 2.3 Verify keyboard "Send" key (`onSubmitEditing`) still works unchanged
- [x] 2.4 Verify empty text guard (send button disabled/opacity 0.4) still prevents submission
