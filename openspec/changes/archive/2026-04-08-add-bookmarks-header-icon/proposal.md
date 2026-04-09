## Why

Bookmarks are currently only accessible via the drawer menu, making them less discoverable. Friends and Waves already have header icons for quick access. Adding a Bookmarks icon to the top nav bar alongside Friends and Waves creates a consistent, easily reachable set of navigation shortcuts.

## What Changes

- Add a `BookmarksHeaderIcon` component to the top navigation bar in `PhotosListHeader`
- Icon appears to the left of Friends and Waves: Bookmarks → Friends → Waves
- Grey (`TEXT_SECONDARY`) when no bookmarks exist, colored (`MAIN_COLOR`) when bookmarks exist
- Navigates to the bookmarks screen on press
- Bookmarks drawer entry remains unchanged

## Capabilities

### New Capabilities
- `bookmarks-header-icon`: A header icon component for bookmarks navigation, following the same pattern as `FriendsHeaderIcon` and `WaveHeaderIcon`

### Modified Capabilities
<!-- No existing spec-level behavior changes -->

## Impact

- **Components**: New `src/components/BookmarksHeaderIcon/index.js`
- **Screens**: Modified `src/screens/PhotosList/components/PhotosListHeader.js` to include the new icon
- **State**: Consumes existing `STATE.bookmarksCount` atom (already fetched by `WaveHeaderIcon`)
- **Dependencies**: Uses existing `Ionicons` (already installed) for the `bookmark` icon
