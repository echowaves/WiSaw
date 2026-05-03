## 1. Fix Send Button / Blur Race Condition

- [x] 1.1 Add `isSubmittingRef = useRef(false)` to Photo component state declarations
- [x] 1.2 Remove `onBlur` handler from the inline `TextInput` — input no longer auto-dismisses on blur
- [x] 1.3 Set `isSubmittingRef.current = true` at the start of both submit handlers (send button `onPress` and `onSubmitEditing`), reset to `false` after completion

## 2. Add Cancel Button

- [x] 2.1 Add a cancel `TouchableOpacity` with an `Ionicons` close-circle icon to the inline input row, positioned to the left of the send button
- [x] 2.2 Wire the cancel button to clear `commentInputText`, set `showCommentInput = false`
- [x] 2.3 Add `inlineCancelButton` style matching the input row appearance

## 3. Fix Optimistic Comment Identity

- [x] 3.1 Add `uuid` field (from component state) to the optimistic comment object in both submit handlers
- [x] 3.2 Add `updatedAt: new Date().toISOString()` to the optimistic comment object in both submit handlers

## 4. Scroll Input Into View on Keyboard

- [x] 4.1 Add `commentInputRef = useRef(null)` and attach it to the inline input row `View`
- [x] 4.2 Thread `onRequestEnsureVisible` prop from `PhotosListMasonry.renderMasonryItem` to `<Photo>` for expanded items
- [x] 4.3 After `setShowCommentInput(true)`, use `setTimeout` + `commentInputRef.current.measureInWindow` + `onRequestEnsureVisible` to scroll the input into view

## 5. Verification

- [x] 5.1 Verify send button submits comment and input dismisses (no race with blur)
- [x] 5.2 Verify cancel button clears text and dismisses input
- [x] 5.3 Verify optimistic comment renders with author name and timestamp
- [x] 5.4 Verify keyboard does not obscure inline input when it appears
- [x] 5.5 Verify tapping outside input dismisses keyboard but keeps input visible
