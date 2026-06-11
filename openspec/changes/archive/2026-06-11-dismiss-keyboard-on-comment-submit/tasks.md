## 1. Inline Comment Input (Photo/index.js)

- [x] 1.1 Add `Keyboard.dismiss()` to `onSubmitEditing` handler (line ~946)
- [x] 1.2 Add `Keyboard.dismiss()` to send button `onPress` handler (line ~974)
- [x] 1.3 Verify keyboard dismisses immediately when pressing keyboard return key
- [x] 1.4 Verify keyboard dismisses immediately when tapping send button
- [x] 1.5 Verify inline input still collapses correctly after keyboard dismissal

## 2. Modal Comment Input (app/modal-input.tsx)

- [x] 2.1 Add `Keyboard.dismiss()` to header send button handler (line ~54)
- [x] 2.2 Verify keyboard dismisses immediately when tapping header send button
- [x] 2.3 Verify modal still navigates back correctly after keyboard dismissal

## 3. Modal Input Text (src/screens/ModalInputText/index.js)

- [x] 3.1 Add `Keyboard.dismiss()` to submit button handler (line ~132)
- [x] 3.2 Verify keyboard dismisses immediately when tapping submit button
- [x] 3.3 Verify modal still navigates back correctly after keyboard dismissal

## 4. Verification

- [ ] 4.1 Test inline comment submission via keyboard return key (keyboard dismisses)
- [ ] 4.2 Test inline comment submission via send button (keyboard dismisses)
- [ ] 4.3 Test modal comment submission via header send button (keyboard dismisses)
- [ ] 4.4 Test modal comment submission via submit button (keyboard dismisses)
- [ ] 4.5 Test empty comment submission does NOT dismiss keyboard (input remains)
- [ ] 4.6 Test no regression in keyboard avoidance when typing
- [ ] 4.7 Test no double-comment submission on slow networks
- [ ] 4.8 Test on both iOS and Android for keyboard animation timing
