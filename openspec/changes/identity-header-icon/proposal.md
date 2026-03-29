## Why

The home screen header has an empty 40x40 slot in the upper left corner with no function. Meanwhile, the identity screen — where users create and manage their anonymous identity — is only reachable through the drawer menu. Adding an identity icon to the header provides a visible, always-present entry point and uses a red dot badge to signal when identity setup is needed.

## What Changes

- **Add an `IdentityHeaderIcon` component**: A tappable icon in the upper-left corner of the photo feed header that shows identity state via icon color (secondary when no identity, `MAIN_COLOR` when active) and a red dot badge when no identity is set
- **Add a popover menu on tap**: Instead of navigating directly, tapping the icon shows a small dropdown with one menu row — either "Set Up Identity" (when no identity) or the current nickname + "Identity" (when active). Tapping the row navigates to `/(drawer)/identity`. Tapping outside dismisses the popover.
- **Fill the empty header slot**: Replace the empty 40x40 `View` in `PhotosListHeader` with the new `IdentityHeaderIcon`

## Capabilities

### New Capabilities
- `identity-header-icon`: Identity status icon in the photo feed header with popover menu and red dot badge for unset identity

### Modified Capabilities
- `wave-header-icon`: No requirement change — just noting that `IdentityHeaderIcon` mirrors the same pattern (self-contained header icon component) for the opposite corner

## Impact

- **New component**: `src/components/IdentityHeaderIcon/index.js`
- **Modified**: `src/screens/PhotosList/components/PhotosListHeader.js` — replace empty left slot with `IdentityHeaderIcon`
- **State read**: `nickName` atom from `src/state.js` (existing, read-only)
- **No new dependencies**: Uses existing `@rneui/themed` Badge, `@expo/vector-icons`, Jotai, expo-router
- **No backend changes**
