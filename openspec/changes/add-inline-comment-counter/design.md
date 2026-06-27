## Context

The Photo component has two comment input paths:
- **Embedded mode** (`embedded === true`): Renders an inline `TextInput` row within the expanded photo card — users type and submit without leaving the feed.
- **Non-embedded mode** (`embedded === false`): Navigates to the `/modal-input` route (a separate full-screen comment composer).

The modal input screen already has a character counter (`140 - inputText.length`) that shows remaining characters. The inline input row has no such feedback. This is a UX regression from when comment input was always a separate screen.

Current inline input row layout (from `src/components/Photo/index.js`, lines 889–971):
```
┌─ inlineCommentInputRow (pill shape, green-tinted) ──────┐
│  [✕ close]  ─ TextInput (flex:1) ─ ─ [✓ send]          │
└─────────────────────────────────────────────────────────┘
```

## Goals / Non-Goals

**Goals:**
- Show remaining character count (e.g., "140", "99", "0") inside the inline input row
- Enforce 140-character limit at the TextInput level via `maxLength`
- Match the exact same 140-character limit used by ModalInputText (`/modal-input`)
- Position the counter between the TextInput and send button for natural reading order

**Non-Goals:**
- Changing the 140-character limit (consistent with existing modal behavior)
- Color-coding the counter (e.g., red when near limit) — out of scope for this change
- Changing the inline input row layout beyond adding the counter element
- Adding character count to the non-embedded modal path (already exists there)

## Decisions

### Decision 1: Counter placement — between input and send button
```
┌─ inlineCommentInputRow ───────────────────────────┐
│  [✕]  ─ TextInput ─ ─ "140" ─ ─ [✓ send]         │
│  close    input      counter      submit           │
└───────────────────────────────────────────────────┘
```

**Rationale:** The counter sits naturally between the text input (what the user types) and the send button (the action). It doesn't require the row to grow or reflow. The send button stays at the far right for easy thumb reach.

**Alternatives considered:**
- Counter to the right of send button → Would require row to widen, breaking the pill shape on small screens.
- Counter above the row → Would add vertical space and break the compact pill aesthetic.
- Counter only on zero → Would be confusing; users want to see remaining budget as they type.

### Decision 2: Show remaining characters (not typed count)
Display `140 - inputText.length` (e.g., "140", "120", "0") rather than typed count ("0", "20", "140").

**Rationale:** Remaining count creates a natural countdown toward the limit, matching the modal input screen's existing behavior and providing clearer urgency feedback.

### Decision 3: Use `maxLength` prop on TextInput + truncate in onChangeText
Set `maxLength={maxStringLength}` on the TextInput AND slice the input in `onChangeText` to `value.slice(0, maxStringLength)`.

**Rationale:** The `maxLength` prop is the native way to prevent extra characters from being entered. The `onChangeText` truncation provides a defensive guard for platforms/keyboard combinations where `maxLength` might be bypassed. This matches the exact pattern used in ModalInputText (line 218-219).

### Decision 4: Shared constant `maxStringLength = 140`
Define `maxStringLength = 140` at the top of `Photo/index.js` (same value as ModalInputText).

**Rationale:** A shared constant ensures consistency. If the limit ever changes, only one value needs updating. The ModalInputText file already has `const maxStringLength = 140` on line 26.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Counter takes horizontal space on small devices (iPhone SE, etc.) | The row already has `minHeight: 36` and `gap: 8`. The counter uses `fontSize: 12` and `fontWeight: '500'` — compact enough. On very small screens the TextInput's `flex: 1` will shrink to accommodate. |
| Counter text could overflow row width causing truncation | TextInput uses `flex: 1` which auto-shrinks. The counter and buttons keep their natural size. No truncation needed. |
| Character count becomes negative if backend API changes limit | The `maxLength` prop enforces the hard cap. Even if the backend limit changes, the frontend won't allow more than 140 chars. |
| onBlur handler might submit text that was truncated | The onBlur handler submits `commentInputText.trim()` which is already truncated by the onChangeText handler. No risk of sending truncated-but-otherwise-invalid text. |

## Open Questions

None. The design mirrors the existing ModalInputText pattern which has been in production since the inline comment input feature was introduced.
