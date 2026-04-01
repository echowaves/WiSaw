## Why

The identity icon (user-secret) in the top-left of the home feed header serves as a prompt for users to set up their identity. Once identity is established (nickName is set), the icon becomes redundant — the user can still access identity settings through the drawer menu. Hiding it after setup reduces visual clutter and frees up header space.

## What Changes

- The `IdentityHeaderIcon` component in the top-left of the home photo feed header will be hidden when the user has an established identity (`nickName !== ''`)
- The icon will continue to appear when no identity is set, serving as a setup prompt with the red badge indicator
- The drawer menu identity item remains unchanged and always accessible

## Capabilities

### New Capabilities

_None — this is a modification of existing behavior._

### Modified Capabilities

- `identity-header-icon`: Hide the icon when identity is established (nickName is set), only show when identity has not been set up yet

## Impact

- **Code**: `src/components/IdentityHeaderIcon/index.js` — add conditional rendering based on `nickName` state
- **Code**: `src/screens/PhotosList/components/PhotosListHeader.js` — may need layout adjustment when icon is hidden
- **UX**: Users with established identity will no longer see the icon in the top-left; they access identity via the drawer instead
