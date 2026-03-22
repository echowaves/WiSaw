## Context

The badge is a red pill rendered with absolute positioning over the auto-group button in `app/(drawer)/waves/index.tsx`. Current styles: `height: 20`, `minWidth: 20`, `borderRadius: 10`, `paddingHorizontal: 4`, `fontSize: 11`. It already grows horizontally via `minWidth`, so the only changes needed are removing the display cap and giving the text more padding.

## Goals / Non-Goals

**Goals:**
- Full ungrouped count is always visible, any digit count.
- Badge pill expands naturally without clipping on either platform.

**Non-Goals:**
- Abbreviating large numbers (e.g., "1.2k").
- Redesigning the badge shape or adding animations.

## Decisions

**Remove the ternary cap, render `{ungroupedCount}` directly.**
The `> 99 ? '99+' :` logic was a workaround for the tight badge. With proper padding the pill handles any reasonable count.

**Bump `paddingHorizontal` from 4 to 6.**
Gives 2px extra space on each side — enough for 3–4 digit numbers to breathe without making single-digit badges look oversized.

## Risks / Trade-offs

- [Very large counts (10 000+) produce a wide pill] → Acceptable; users benefit from knowing the real count, and the pill remains proportional to the button at realistic magnitudes.
