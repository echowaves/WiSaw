## Why

The top nav header icons for Friends and Waves use conditional color logic — showing `MAIN_COLOR` when activity exists and `TEXT_SECONDARY` when inactive. The corresponding drawer menu items for these same screens use the drawer's default inactive tint color, ignoring activity state. This inconsistency means users see a "lit up" icon in the header but a plain grey icon in the drawer for the same feature. Aligning the drawer icon colors with the header icons creates a cohesive visual language across both navigation surfaces.

## What Changes

- **Friends drawer icon**: Add conditional color logic — use `MAIN_COLOR` when user has friends (`friendsList.length > 0`), otherwise use the drawer's default `color` prop. This matches `FriendsHeaderIcon`.
- **Waves drawer icon**: Add conditional color logic — use `MAIN_COLOR` when wave activity exists (`wavesCount > 0` or `ungroupedPhotosCount > 0`), otherwise use the drawer's default `color` prop. This matches `WaveHeaderIcon`.

_(Identity drawer icon already matches its header counterpart — no change needed.)_

## Capabilities

### New Capabilities

- `friends-drawer-icon`: Friends drawer icon with conditional color — `MAIN_COLOR` when user has friends, default color otherwise. Matches `FriendsHeaderIcon` color logic.

### Modified Capabilities

- `drawer-waves-badge`: Add icon color logic to match header — `MAIN_COLOR` when activity exists, default color otherwise.

## Impact

- `app/(drawer)/_layout.tsx` — `WavesDrawerIcon` and the Friends drawer icon definition: add Jotai atom reads and conditional color.
- New atoms read in drawer: `STATE.friendsList`, `STATE.wavesCount` (already available, just not consumed by drawer icons).
- No API, dependency, or state changes required.
