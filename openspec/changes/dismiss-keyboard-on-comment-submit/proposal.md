# Proposal: Dismiss Keyboard on Comment Submit

## Problem

When users tap the send button to post a comment (either inline in Photo view or in the modal input), the keyboard remains visible after the comment is submitted. This creates a suboptimal user experience where:

- The keyboard obscures content after submission
- Users must manually tap somewhere to dismiss it
- The flow feels incomplete until keyboard dismisses

## What Changes

**Behavior**: Comment submission should dismiss the keyboard immediately upon send button tap (or keyboard return key).

### Files to Modify

| File | Location | Change |
|------|----------|--------|
| `src/components/Photo/index.js` | Inline comment input | Add `Keyboard.dismiss()` to both `onSubmitEditing` and send button handlers |
| `app/modal-input.tsx` | Modal comment header | Add `Keyboard.dismiss()` to header send button handler |
| `src/screens/ModalInputText/index.js` | Modal comment submit | Add `Keyboard.dismiss()` to submit button handler |

### Implementation Details

**Inline comments** (Photo/index.js):
- Line ~946: `onSubmitEditing` handler → add `Keyboard.dismiss()` after submission
- Line ~974: Send button `onPress` → add `Keyboard.dismiss()` after submission

**Modal comments**:
- `app/modal-input.tsx` line ~54: Add `Keyboard.dismiss()` before `router.back()`
- `src/screens/ModalInputText/index.js`: Add `Keyboard.dismiss()` in submit handler

## Impact

- **User Experience**: Immediate visual feedback when comment is posted
- **Interaction Flow**: Completes the submission gesture cleanly
- **Keyboard Behavior**: Consistent with other text input scenarios in the app

## Non-Goals

- Changing comment submission logic
- Modifying keyboard avoidance behavior
- Changing modal navigation flow (still calls `router.back()`)

## Acceptance Criteria

- [ ] Tapping send button dismisses keyboard immediately
- [ ] Pressing keyboard return key dismisses keyboard immediately  
- [ ] Comment still posts successfully after keyboard dismissal
- [ ] No regression in keyboard avoidance when typing
- [ ] Works for both inline and modal comment inputs