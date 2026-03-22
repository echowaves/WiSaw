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

**Set `minWidth: 28` and `paddingHorizontal: 6`.**
The original `minWidth: 20` with `paddingHorizontal: 10` left zero content area (20 - 10 - 10 = 0), making text invisible. Raising `minWidth` to 28 ensures the content area is at least 16px at minimum size (28 - 6 - 6 = 16), which comfortably fits 2 digits. The View grows beyond `minWidth` automatically for wider numbers. Single-digit counts still render as a near-circle (28×20) which looks proportional on the 44px button.

## Risks / Trade-offs

- [Very large counts (10 000+) produce a wide pill] → Acceptable; users benefit from knowing the real count, and the pill remains proportional to the button at realistic magnitudes.
- [Parent clipping] → iOS defaults `overflow: 'hidden'` on Views, so the absolutely-positioned badge gets clipped when it extends beyond the button bounds. Fixed by adding `overflow: 'visible'` to the parent TouchableOpacity.
