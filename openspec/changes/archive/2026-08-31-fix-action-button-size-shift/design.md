## Context

All 5 photo action buttons are rendered by a single shared component, `src/components/PhotoActionButtons/index.js`, consumed by:
- `src/components/Photo/index.js` (expanded photo view, `renderActionCard`)
- `src/components/QuickActionsModal/index.js` (photo preview overlay)

The shift bug lives entirely in this component's `createStyles(theme)`:
- `actionButton` sets `minWidth: 72`, `borderRadius: 20`, `height: 32`.
- `actionButtonDisabled` (applied on top when a button is disabled) overrides `minWidth: 32` and `borderRadius: 16` — so a button that transitions enabled → disabled physically shrinks by ~40px, and the row reflows.

Disabled triggers per button:
- Report: `isPhotoWatched === undefined || isPhotoWatched || isPhotoBannedByMe()`
- Delete: `isPhotoWatched === undefined || isPhotoWatched`
- Bookmark: `isPhotoWatched === undefined`
- Wave: `!isOwnPhoto`
- Share: `isPhotoWatched === undefined`

## Goals / Non-Goals

**Goals:**
- Button state (enabled/disabled) changes appearance only (background, border, opacity, shadow, icon color) — never width, height, padding, margin, or border radius.
- Identical behavior in both consumer views (single component, so one fix covers both).

**Non-Goals:**
- Redesigning the action button appearance (colors, icons, shape, disabled styling rules unchanged).
- Changing which buttons disable under which conditions.

## Decisions

**1. Remove geometry overrides from `actionButtonDisabled`.**
Drop `minWidth: 32` and `borderRadius: 16` from the disabled style. Keep only appearance properties: `backgroundColor`, `borderColor`, `opacity`, `shadowOpacity`, `elevation`.
- Alternative considered: give the disabled style the same explicit geometry as the base (`minWidth: 72`, `borderRadius: 20`). Rejected — redundant; inheritance already provides it, and duplicating geometry in two places is exactly what caused this bug.

**2. Keep per-button icon color logic as-is.**
Colors already follow state correctly (`theme.TEXT_DISABLED` when disabled, accent colors when enabled). No change needed — satisfies the "color reflects state" requirement without touching size.

**3. Single-point fix, no consumer changes.**
Both views render the shared component, so fixing the style definition is sufficient. `Photo/index.js` and `QuickActionsModal/index.js` need no edits.

**4. Two-row layout: Wave button last, on its own line.**
The outer container becomes a column of two rows: row 1 is the existing wrapping row with Report, Delete, Bookmark, Share; row 2 is a full-width centered row containing only the Wave button. Alternatives considered:
- `flexBasis: '100%'` on the Wave button inside the existing wrapping row — rejected: it makes the button full-width, contradicting the fixed-width decision, and keeps layout coupled to sibling widths.
- Relying on `flexWrap` to push the 5th button down — rejected: on wide screens (tablets) a 120px button fits on row 1, so it would not be "always on its own line".
Two stacked rows guarantee the invariant on every screen size and make the layout fully deterministic.

**5. Wave button fixed width with ellipsis (option A).**
The Wave button gets an explicit `width` (120) replacing `minWidth` inheritance for this button only; the label `Text` keeps `numberOfLines={1}` and gains `ellipsizeMode='tail'` plus `flexShrink: 1` so truncation actually happens inside the fixed frame. 120 fits the widest guaranteed label "Add to Wave" (icon 16 + gap 2 + ~75px text + 6 padding ≈ 99) with margin; longer wave names truncate. The exact width is a design constant that can be tuned in implementation without spec impact.

## Risks / Trade-offs

- [Disabled buttons become visually wider than before] → This is the intended fix; the row layout was always designed around `minWidth: 72` (enabled state), so this restores the original intended look.
- [Double dimming: container `opacity: 0.5` + already-muted `TEXT_DISABLED` icon colors] → Pre-existing, cosmetic, and out of scope; behavior unchanged.
- [Long wave names are truncated] → Accepted trade-off of option A; the wave name is visible elsewhere (wave card, WaveSelectorModal). Tunable via the width constant if 120 proves too tight.
- [Layout change (Wave moves to a second line) is a visible UX change beyond the bug fix] → Explicitly requested; spec scenarios pin the new layout so it cannot regress to a single wrapping row.

## Migration Plan

No migration. Pure style change in one component; ships with the next app build. Rollback = revert the style diff.
