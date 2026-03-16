## Context

The expanded photo view action bar renders 5 buttons, each with an icon and text label. Each button has an "is disabled" condition that applies `actionButtonDisabled` style. Currently text labels render regardless of disabled state.

## Goals / Non-Goals

**Goals:**
- Hide text labels on disabled action buttons (icon-only)
- Keep text labels visible on enabled action buttons

**Non-Goals:**
- Changing button layout, sizing, or icon appearance
- Adding tooltips or alternative affordances for disabled buttons

## Decisions

### Decision 1: Conditional rendering of Text, not display:none

Wrap each button's `<Text>` in a condition that mirrors the button's disabled check. React Native doesn't support `display: 'none'` reliably across platforms, and conditional rendering is the established pattern in this codebase.

Each button already has a boolean expression for its disabled state — reuse the same expression to conditionally render the text.

### Decision 2: Round shape for disabled (icon-only) buttons

Since disabled buttons show only an icon (no text), they should appear as circles rather than pills. Override `minWidth` to match `height` (32) and set `borderRadius: 16` in `actionButtonDisabled` so the button becomes a perfect circle around the icon.

## Risks / Trade-offs

- [Button width changes when disabled] → Disabled buttons become 32×32 circles, which comfortably fits the icon.
