## Why

The drawer's Waves icon currently shows a numbered badge (e.g., "3", "99+") for ungrouped photos, while the top nav bar's WaveHeaderIcon uses a simple red dot without a number. This visual inconsistency is confusing. The drawer badge should match the header icon's simpler red-dot style and suppression logic (hidden when ungrouped count is 0).

## What Changes

- Replace the numbered badge on the drawer's `WavesDrawerIcon` with a small red dot (no text), matching the `WaveHeaderIcon` badge style.
- Suppress the badge entirely when `ungroupedPhotosCount` is `null` or `0`, matching the header icon's `showBadge` logic.
- Remove the `badgeText` computation since it is no longer needed.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `drawer-waves-badge`: Change the badge from a numbered indicator to a red dot without text, and suppress it when ungrouped count is 0.

## Impact

- `app/(drawer)/_layout.tsx` — `WavesDrawerIcon` component: replace numbered badge View+Text with a simple dot View.
- No API, dependency, or state changes required. The existing `ungroupedPhotosCount` atom is already used by both components.
