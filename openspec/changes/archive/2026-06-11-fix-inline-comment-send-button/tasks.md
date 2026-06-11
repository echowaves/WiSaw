## 1. Fix inline send button touch handling

- [x] 1.1 Remove `sendTappedRef`, keep only `cancelTappedRef` ref
- [x] 1.2 Add `onBlur` on TextInput that submits on blur (skip if cancel was tapped or text is empty)
- [x] 1.3 Cancel button sets `cancelTappedRef` before clearing state
- [x] 1.4 Add `console.log` in `onBlur` for debugging

## 2. Verify

- [x] 2.1 Test on iOS: type a comment, tap send button — keyboard dismisses and comment submits on first tap
- [x] 2.2 Test on Android: same flow confirms cross-platform correctness
- [x] 2.3 Verify keyboard "Send" key (`onSubmitEditing`) still works unchanged
- [x] 2.4 Verify empty text guard (send button disabled/opacity 0.4) still prevents submission
- [x] 2.5 Verify `console.log` confirms `onBlur` fires and guards are correct

## 3. Cleanup (optional, cosmetic)

- [x] 3.1 Remove debug `console.log` from `onBlur` handler
