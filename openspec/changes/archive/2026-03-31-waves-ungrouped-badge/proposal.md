## Why

Users have no visibility into ungrouped photo count from the drawer navigation. The ungrouped count is only visible after navigating to the Waves screen, so users don't know they have photos waiting to be grouped. Adding a numeric badge to the Waves drawer item creates an at-a-glance call-to-action. Additionally, the existing kebab menu badge on the Waves screen has no upper bound, which can look broken with very large numbers.

## What Changes

- Add a numeric badge to the Waves drawer item showing the ungrouped photos count, reading from the existing `ungroupedPhotosCount` Jotai atom
- Cap the badge display at "99+" for counts exceeding 99, both in the drawer and in the Waves screen kebab menu
- Follow the existing `IdentityDrawerIcon` pattern of inline components for drawer item customization

## Capabilities

### New Capabilities
- `drawer-waves-badge`: Numeric badge on the Waves drawer item showing ungrouped photo count with 99+ cap

### Modified Capabilities
- `wave-edit-menu`: Cap the existing ungrouped count badge display at 99+

## Impact

- `app/(drawer)/_layout.tsx`: New `WavesDrawerIcon` component, updated Waves `Drawer.Screen` options
- `app/(drawer)/waves/index.tsx`: Badge text capped at 99+
- No new dependencies, APIs, or state changes — uses existing `STATE.ungroupedPhotosCount` atom
