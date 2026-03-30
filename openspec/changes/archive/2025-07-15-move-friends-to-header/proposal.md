## Why

The Friends button currently lives in the footer alongside the camera buttons, making it feel like a secondary action. Moving it to the top header—side by side with the Waves icon—elevates it as a primary navigation destination and mirrors how Waves is accessed. This also simplifies the footer to focus purely on content creation (video, photo) and the drawer menu.

## What Changes

- Create a new `FriendsHeaderIcon` component that renders the friends icon with an unread-count badge dot, reads friend unread state from a Jotai atom, and navigates to `/friends` on press.
- Update `PhotosListHeader` to place `FriendsHeaderIcon` next to `WaveHeaderIcon` in a right-side row.
- Remove the Friends button from `PhotosListFooter`, reducing it to 3 buttons (drawer, video, camera).
- Introduce a global Jotai atom for the friends unread count so the header icon can reactively display it without prop-drilling.

## Capabilities

### New Capabilities
- `friends-header-icon`: Self-contained header icon component for Friends navigation with unread badge, modeled after WaveHeaderIcon.

### Modified Capabilities
- `photo-feed`: PhotosListHeader gains a second right-side icon; PhotosListFooter loses the Friends button and becomes a 3-button layout.
- `identity-header-icon`: No requirement change, but layout context changes—identity icon remains on the left while the right side now holds two icons.

## Impact

- **Components**: `PhotosListHeader`, `PhotosListFooter`, new `FriendsHeaderIcon`
- **State**: New Jotai atom `friendsUnreadCount` (or reuse of existing unread count plumbing from `PhotosList/index.js`)
- **Screens**: Only the home feed (`PhotosList`) is affected. BookmarksList, WaveDetail, and other screens using `AppHeader` are not changed.
- **Drawer**: The Friends item in the drawer remains as-is for alternative access.
- **Dependencies**: No new packages required; uses existing `FontAwesome5`, Jotai, and expo-router.
