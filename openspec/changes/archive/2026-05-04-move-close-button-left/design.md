## Context

The inline comment input is part of the Photo component (`src/components/Photo/index.js`). It appears when a user clicks "Add Comment" in embedded mode (masonry feed). The current layout places the close button (X) after the text input and before the send button, which makes it easy to fat-finger when the keyboard is up.

Current layout:
```
┌─────────────────────────────────────────────────────────────┐
│ [TextInput (flex:1)] [Close X] [Send →]                    │
│  ← fills available space      │      │                      │
│                               right   right                 │
└─────────────────────────────────────────────────────────────┘
```

## Goals / Non-Goals

**Goals:**
- Move the close button to the left side of the input field
- Reduce fat-fingering risk by separating close button from send button
- Maintain existing visual styling and behavior

**Non-Goals:**
- No changes to the modal input screen (different pattern)
- No changes to the "Add Comment" button styling
- No changes to the comment submission logic

## Decisions

**Approach**: Simple element reordering in JSX

The fix requires only reordering the JSX elements within the `inlineCommentInputRow` view. The close button should be rendered before the TextInput, not after.

**Why this approach:**
- Minimal code change (only reordering, no new components)
- No style changes needed (flex layout handles it naturally)
- No state or logic changes required
- Follows common mobile UI patterns (close/cancel on left, submit on right)

**Alternatives considered:**
1. Add padding/margin to separate buttons - Rejected: doesn't solve the fundamental issue
2. Use a different icon position - Rejected: unnecessary complexity
3. Add a confirmation dialog - Rejected: would degrade UX

## Risks / Trade-offs

- **Risk**: None identified. This is a purely visual change with no functional impact.
- **Trade-offs**: None. The change improves UX without downsides.
