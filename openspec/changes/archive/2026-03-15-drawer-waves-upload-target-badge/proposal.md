## Why

The Waves drawer badge currently shows the ungrouped photo count, duplicating information already available on the header nav bar auto-group button. The drawer badge should instead indicate whether an Upload Target wave is set — a more useful at-a-glance signal — and display the target wave name alongside the drawer label.

## What Changes

- Remove the ungrouped photo count badge from the Waves drawer item in `_layout.tsx`
- Remove the associated `getUngroupedPhotosCount` fetch and `subscribeToAutoGroupDone` subscription from the drawer's `DrawerLayout`
- Add a badge indicator on the Waves drawer icon that shows when an upload target wave is set (using the `uploadTargetWave` Jotai atom)
- Append the upload target wave name to the Waves drawer label (e.g., "Waves — My Wave Name")

## Capabilities

### New Capabilities

### Modified Capabilities

- `auto-group-photos`: Removing the drawer badge requirement for ungrouped photo count

## Impact

- `app/(drawer)/_layout.tsx` — drawer Waves item: replace ungrouped count badge with upload target indicator, add wave name to label
- No new dependencies; uses existing `uploadTargetWave` Jotai atom from `src/state.js`
