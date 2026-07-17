## 1. Remove auto-submit from search TextInput

- [x] 1.1 Remove `onSubmitEditing` handler from `TextInput` in `src/components/SearchFab/index.js`; replace with handler that only calls `Keyboard.dismiss()`
- [x] 1.2 Change `returnKeyType` from `'search'` to `'done'` on the same `TextInput`

## 2. Add keyboard height tracking to PhotosList screen

- [x] 2.1 Add `keyboardHeight` state and `Keyboard.addListener` for `keyboardWillShow`/`keyboardWillHide` (and `keyboardDidShow`/`keyboardDidHide` for Android fallback) in `src/screens/PhotosList/index.js`
- [x] 2.2 Compute `effectivePaddingBottom` as `FOOTER_HEIGHT + 56 + 32 + keyboardHeight` and pass as `contentPaddingBottom` to `PhotosListMasonry`

## 3. Update specs

- [x] 3.1 Update `openspec/specs/search-fab/spec.md`: change masonry "SHALL NOT resize" scenario to "SHALL adjust bottom padding"; change Return key scenario to dismiss-only
- [x] 3.2 Update `openspec/specs/search-input-validation/spec.md`: remove keyboard submit scenarios, add "Return key does not submit" requirement
