## 1. Disable send button when input is too short

- [x] 1.1 Add `const canSubmit = searchTerm.length >= 3` derived boolean in SearchFab
- [x] 1.2 Pass `disabled={!canSubmit}` to the FAB `Pressable` and set `opacity: canSubmit ? 1 : 0.4` on the FAB button style

## 2. Guard keyboard submission

- [x] 2.1 Wrap the `onSubmitEditing` handler to short-circuit when `searchTerm.length < 3`

## 3. Test

- [x] 3.1 Verify send button appears disabled (dimmed) with 0, 1, or 2 characters
- [x] 3.2 Verify send button appears enabled and submits with 3+ characters
- [x] 3.3 Verify keyboard return key does not submit with fewer than 3 characters
- [x] 3.4 Verify keyboard return key submits normally with 3+ characters
