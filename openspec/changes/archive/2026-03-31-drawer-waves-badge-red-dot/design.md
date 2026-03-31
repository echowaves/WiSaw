## Context

The drawer's `WavesDrawerIcon` (in `app/(drawer)/_layout.tsx`) currently renders a numbered red badge showing the ungrouped photos count (e.g., "3", "99+"). The top nav bar's `WaveHeaderIcon` (in `src/components/WaveHeaderIcon/index.js`) uses a simpler red dot with no text. Both components consume the same `ungroupedPhotosCount` Jotai atom, but their badge presentations differ.

## Goals / Non-Goals

**Goals:**
- Make the drawer's waves badge visually match the header icon's red-dot style.
- Suppress the badge when ungrouped count is 0 or null (already the case, no change needed for suppression logic).

**Non-Goals:**
- Changing the `WaveHeaderIcon` in the top nav bar.
- Changing how `ungroupedPhotosCount` is fetched or stored.
- Adding any new state atoms or API calls.

## Decisions

**Use a simple red dot instead of numbered badge**
The `WaveHeaderIcon` already uses a 10×10 red dot with a 2px border matching the header background. The drawer badge will use the same approach but without the border (the drawer doesn't have the same layering concern). The dot will be 8×8, matching the existing `IdentityDrawerIcon` dot style in the same file — this keeps the drawer badges visually consistent with each other.

**Alternative considered**: Keeping the number but shrinking the badge. Rejected because the user explicitly wants the header icon's dot style.

**Reuse existing showBadge logic pattern**
The condition `ungroupedCount != null && ungroupedCount > 0` is already used in both components. No change to the boolean logic is needed — only the rendered View changes.

## Risks / Trade-offs

- [Minor visual change] → Users lose at-a-glance count info in the drawer. Mitigated by the fact that the Waves screen itself shows full detail.
- [No risk of regression] → The change is purely cosmetic, touching only the badge View/Text rendering inside one component.
