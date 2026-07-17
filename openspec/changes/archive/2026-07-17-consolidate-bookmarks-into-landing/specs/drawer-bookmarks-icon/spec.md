## REMOVED Requirements

### Requirement: Bookmarks drawer icon color reflects bookmark state
**Reason**: The Bookmarks drawer item is removed entirely. The bookmarks count is no longer displayed in the drawer.
**Migration**: The `bookmarksCount` atom is retained for other consumers (WaveHeaderIcon). The `BookmarksDrawerIcon` component is deleted.

### Requirement: Bookmarks count global atom
**Reason**: The `bookmarksCount` atom itself is retained (used by WaveHeaderIcon), but its relationship to the drawer icon is removed.
**Migration**: No migration needed for the atom itself. Only the `BookmarksDrawerIcon` consumer is removed.

### Requirement: Bookmarks count reducer function
**Reason**: The `getBookmarksCount` function is retained (used by WaveHeaderIcon).
**Migration**: No migration needed; this function continues to serve WaveHeaderIcon.
