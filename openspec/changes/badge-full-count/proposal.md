## Why

The ungrouped-photos count badge on the auto-group button clips or overflows when the number is large. The current code caps the display at "99+", but even that 3-character string doesn't fit cleanly in the fixed-height 20px badge. Users want to see the actual count, not a capped approximation.

## What Changes

- Remove the `99+` cap — display the raw ungrouped count regardless of magnitude.
- Increase badge `paddingHorizontal` so the text has breathing room inside the pill.
- The badge already uses `minWidth` (not fixed `width`), so it naturally grows into a pill shape for wider numbers.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `waves-auto-group-header`: Badge now displays the full ungrouped count instead of capping at "99+", with adjusted padding to accommodate wider numbers.

## Impact

- `app/(drawer)/waves/index.tsx` — badge JSX and styles only. No logic, API, or dependency changes.
