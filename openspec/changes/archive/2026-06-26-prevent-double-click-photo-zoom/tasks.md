## 1. Implement tap debounce in ImageView

- [x] 1.1 Add `lastTapTime` ref and `TAP_DEBOUNCE_MS = 1000` constant to `ImageView` component
- [x] 1.2 Update `onSingleTapEvent` to check elapsed time since last navigation before calling `router.push('/pinch')`
- [x] 1.3 Remove unused `onPinchEvent` function (dead code)
- [x] 1.4 Verify the change compiles and the file structure is correct

## 2. Verify behavior

- [x] 2.1 Single tap on a photo opens the zoomed view
- [x] 2.2 Double tap on a photo does not open the zoomed view twice (second tap is ignored)
- [x] 2.3 Tapping a photo, waiting >500ms, then tapping again opens the zoomed view independently
- [x] 2.4 Tapping different photos rapidly does not interfere with each other's debounce state