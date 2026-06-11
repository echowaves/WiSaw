## Context

The comments system has two entry points:

1. **Inline comments**: When `embedded === true`, the Photo component renders an inlineTextInput within the expanded photo card
2. **Modal comments**: When `embedded === false`, users navigate to `/modal-input` route

Both paths have a send button that submits the comment, but neither currently dismisses the keyboard after submission. This leaves the keyboard obscuring content and creates an incomplete user experience.

Current submission flow:
- User types comment
- User taps send button (or presses keyboard return)
- Comment submits via `reducer.submitComment()`
- Backend mutation + `watchPhoto` + `getPhotoDetails` complete
- `emitPhotoRefresh()` notifies other components
- Modal navigates away (`router.back()`) or inline input collapses

**Missing**: Keyboard dismissal happens at the wrong time or not at all.

## Goals / Non-Goals

**Goals:**
- Dismiss keyboard immediately when user taps send button (both inline and modal)
- Dismiss keyboard immediately when user presses keyboard return key (onSubmitEditing)
- Maintain existing submission behavior (mutation, refresh, navigation)
- No visual jarring or race conditions

**Non-Goals:**
- Changing comment submission logic
- Modifying keyboard avoidance when typing (KeyboardAwareScrollView)
- Changing modal navigation behavior (still calls `router.back()`)
- Adding new dependencies or major refactoring

## Decisions

### Decision 1: Explicit Keyboard Dismissal (not relying on navigation)

**Approach**: Call `Keyboard.dismiss()` explicitly after comment submission completes, before navigation.

**Rationale**: 
- React Navigation's modal dismissal doesn't guarantee keyboard dismissal
- Explicit control gives immediate visual feedback
- Consistent with other input scenarios in the app (SearchFab, PhotosList)

**Alternatives considered**:
- Relying on `router.back()` to dismiss keyboard → not guaranteed
- Using `blurOnSubmit={true}` on TextInput → only works for return key, not send button tap

### Decision 2: Placement in Code Flow

**Approach**: Call `Keyboard.dismiss()` in the submit handler AFTER the mutation completes but BEFORE navigation.

```js
// Pattern
await reducer.submitComment(...)
emitPhotoRefresh(...)
await reducer.getPhotoDetails(...)
Keyboard.dismiss()  // ← Add this
router.back()       // or setShowCommentInput(false)
```

**Rationale**:
- User sees keyboard dismiss immediately after submission completes
- No race condition between keyboard and navigation
- Smooth visual flow: submit → keyboard gone → screen transitions

### Decision 3: Update Inline Comment Handlers

**Approach**: Add `Keyboard.dismiss()` to both submit handlers in Photo/index.js:
- Line ~946: `onSubmitEditing` (keyboard return key)
- Line ~974: Send button `onPress`

**Rationale**: Both entry points should have identical behavior. Users expect consistent feedback regardless of how they submit.

### Decision 4: Update Modal Submit Handlers

**Approach**: Add `Keyboard.dismiss()` to:
- `app/modal-input.tsx` header send button handler (line ~54)
- `src/screens/ModalInputText/index.js` submit button handler

**Rationale**: Modal input has its own submit flow separate from inline. Both need keyboard dismissal.

## Risks / Trade-offs

**[Keyboard dismissal timing on slow networks]** → If mutation takes >1s, user might tap again before keyboard dismisses.  
**Mitigation**: Send button shows loading state (hourglass) during submission, preventing double-tap.

**[Android keyboard animation timing]** → Android keyboard dismissal animation might conflict with modal navigation.  
**Mitigation**: Dismiss keyboard BEFORE calling `router.back()`, so animations don't overlap.

**[Inline input collapse timing]** → If keyboard dismisses but input is still visible briefly, user might see UI jump.  
**Mitigation**: `setShowCommentInput(false)` happens before keyboard dismiss, so input collapses first.
