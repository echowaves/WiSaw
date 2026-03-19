## Context

The dark mode theme defines `INTERACTIVE_BACKGROUND` as `rgba(234, 94, 61, 0.15)` — a semi-transparent coral. When composited over `#121212` (BACKGROUND), it renders as approximately `#563027`, a warm dark brown. However, because it's semi-transparent, the actual visible color varies depending on the parent view's background. This causes subtle inconsistencies across screens and makes the list gaps in WavesHub appear pinkish.

The token is used in two contexts:
1. **Screen/list container backgrounds** — WavesHub, WaveDetail, PhotosList containers
2. **Small interactive elements** — modal cancel buttons, WaveCard placeholders, add-photo buttons

## Goals / Non-Goals

**Goals:**
- Make the dark mode `INTERACTIVE_BACKGROUND` color consistent regardless of view hierarchy
- Eliminate the pinkish appearance in list gaps on wave-related screens
- Single-token fix with zero changes to screen files

**Non-Goals:**
- Changing light mode colors
- Redesigning the theme token system
- Modifying any component or screen files

## Decisions

**Use opaque `#563027` instead of `rgba(234, 94, 61, 0.15)`**

Rationale: `#563027` is the actual composited result users already see in PhotosList (where it layers over `#121212`). Making it opaque ensures identical rendering everywhere, removes layer-dependency, and preserves the existing visual identity. No component code changes needed.

Alternative considered: Adding a separate `LIST_BACKGROUND` token. Rejected because it adds token sprawl for a problem that's better solved at the source.

## Risks / Trade-offs

- [Visual shift on elements with non-standard parent backgrounds] → Minimal risk. Any element using `INTERACTIVE_BACKGROUND` over a parent other than `#121212` would previously composite differently; now it will always be `#563027`. This is the desired behavior — consistency.
- [Opacity-based blending lost] → The semi-transparent blending effect is intentionally removed. The warm brown tone is preserved via the opaque equivalent.
