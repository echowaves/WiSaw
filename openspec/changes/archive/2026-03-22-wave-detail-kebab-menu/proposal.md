## Why

The Wave Detail screen uses a horizontal ellipsis icon (`Ionicons` `ellipsis-horizontal`, size 24) with minimal styling (just `padding: 8`) for its header menu button, while the Waves list screen uses a vertical kebab icon (`MaterialCommunityIcons` `dots-vertical`, size 22) with a styled button (background, border, `SHARED_STYLES.interactive.headerButton`). This visual inconsistency makes the two screens feel disconnected.

## What Changes

- Replace the Wave Detail header right icon from `Ionicons` `ellipsis-horizontal` with `MaterialCommunityIcons` `dots-vertical`
- Apply the same button styling used on the Waves list header (background, border, `SHARED_STYLES.interactive.headerButton`)
- Match icon size to 22 for consistency

## Capabilities

### New Capabilities
_(none)_

### Modified Capabilities
- `wave-detail`: Update the header menu icon appearance requirement to specify kebab (`dots-vertical`) icon with styled button matching the Waves list header

## Impact

- **File**: `app/(drawer)/waves/[waveUuid].tsx` — header right configuration change (icon + styling)
- No logic, API, or dependency changes
