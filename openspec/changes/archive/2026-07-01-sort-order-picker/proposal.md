## Why

The current sort/order picker for the Friends and Waves screens uses a vertical ActionMenu list with icons and checkmarks. The desired UX is an iOS-style segmented pill toggle presented in a bottom sheet — more compact, visually clearer about mutual exclusivity, and matching the native feel shown in the reference screenshot (A-Z / Z-A / Status toggle).

## What Changes

- Create a reusable `SortOrderPicker` component with two layout modes:
  - **Segmented** (pill toggle) for screens with 2-4 options (Friends)
  - **2×2 Grid** for screens with exactly 4 options (Waves)
- Replace the ActionMenu-based sort picker in `FriendsList` with `SortOrderPicker` (segmented mode, 3 options)
- Replace the ActionMenu-based sort picker in `WavesHub` with `SortOrderPicker` (grid mode, 4 options)
- No behavioral changes to sort logic — purely a UI replacement

## Capabilities

### Modified Capabilities
- `friends-sort`: Update UI requirement from ActionMenu to SortOrderPicker segmented control
- Wave sort (inline in this change): Update UI requirement from ActionMenu to SortOrderPicker grid

## Impact

- **Affected code:**
  - `src/screens/FriendsList/index.js` — replace sortMenuVisible + sortMenuItems with SortOrderPicker
  - `src/screens/WavesHub/index.js` — replace headerMenuVisible + headerMenuItems with SortOrderPicker
  - `src/components/ActionMenu/index.js` — no changes (remains available for other uses)
- **New files:**
  - `src/components/SortOrderPicker/index.js`
- **Dependencies:** None