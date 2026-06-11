## 1. Fix inline send button touch handling

- [x] 1.1 Add `sendTappedRef` and `cancelTappedRef` ref flags
- [x] 1.2 Add `onTouchStart` on send button to set `sendTappedRef`
- [x] 1.3 Add `onBlur` on TextInput that checks flag and submits (skip if cancel was tapped)
- [x] 1.4 Cancel button sets `cancelTappedRef` before clearing state

## 2. Verify

- [ ] 2.1 Test on iOS: type a comment, tap send button — keyboard dismisses and comment submits on first tap
- [ ] 2.2 Test on Android: same flow confirms cross-platform correctness
- [x] 2.3 Verify keyboard "Send" key (`onSubmitEditing`) still works unchanged
- [x] 2.4 Verify empty text guard (send button disabled/opacity 0.4) still prevents submission
