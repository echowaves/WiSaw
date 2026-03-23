## Why

The Waves list header kebab button accesses theme colors via `SHARED_STYLES.theme.*`, which is a static export hardcoded to `LIGHT_THEME`. This means the button background, border, and icon color never update in dark mode. The Wave detail header correctly uses `getTheme(isDarkMode)` for reactive theming. The two screens should use the same pattern.

## What Changes

- Replace `SHARED_STYLES.theme.*` references in the Waves list header button with reactive theme values from `getTheme(isDarkMode)`
- Import `getTheme` alongside `SHARED_STYLES` (keep `SHARED_STYLES.interactive.headerButton` for the base style)
- Add `isDarkMode` atom + `const theme = getTheme(isDarkMode)` to the component, matching Wave detail's pattern

## Capabilities

### New Capabilities
_(none)_

### Modified Capabilities
- `waves-auto-group-header`: Update the kebab button styling to use reactive theme instead of static `SHARED_STYLES.theme`

## Impact

- **File**: `app/(drawer)/waves/index.tsx` — import change + theme access pattern change
- Fixes dark mode rendering bug on the Waves list header button
