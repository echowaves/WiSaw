## Why

The wave action sheet menus in both WaveDetail and WavesHub screens contain two redundant items — "Rename" and "Edit Description" — that open the exact same modal with the same fields (wave name + description). This creates unnecessary UI clutter and user confusion, since both actions lead to an identical editing experience.

## What Changes

- Remove the separate "Rename" and "Edit Description" menu items from the wave action sheet
- Replace them with a single "Edit Wave" menu item that opens the existing edit modal (unchanged)
- Apply this consolidation in both WaveDetail (header menu) and WavesHub (long-press context menu)

## Capabilities

### New Capabilities
- `wave-edit-menu`: Consolidate redundant wave action sheet menu items into a single "Edit Wave" entry

### Modified Capabilities

## Impact

- `src/screens/WaveDetail/index.js` — `headerMenuItems` array: two items become one
- `src/screens/WavesHub/index.js` — `contextMenuItems` array: two items become one
- No API, dependency, or backend changes
- No changes to the edit modal itself
