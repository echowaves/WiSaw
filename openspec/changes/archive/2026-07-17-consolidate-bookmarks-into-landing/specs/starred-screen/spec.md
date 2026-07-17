## REMOVED Requirements

### Requirement: Starred screen accessible from drawer
**Reason**: Bookmarks functionality is consolidated into the landing screen as a toggle FAB. The standalone Bookmarks screen and drawer item are removed.
**Migration**: Users access bookmarked photos by tapping the toggle FAB on the landing screen, which switches between geo feed and bookmarks feed in-place.

### Requirement: Starred screen displays watched photos feed
**Reason**: The watched photos feed is now a mode of the PhotosList screen, not a separate screen.
**Migration**: The `feedForWatcher` query is called by PhotosList when `isBookmarksMode` is `true`.

### Requirement: Starred screen uses AppHeader
**Reason**: The standalone Bookmarks screen no longer exists.
**Migration**: The landing screen header remains unchanged; the toggle FAB communicates the mode.

### Requirement: Starred screen empty state
**Reason**: The standalone Bookmarks screen no longer exists.
**Migration**: Empty state for bookmarks is handled within PhotosList when `isBookmarksMode` is `true` and no bookmarks exist.

### Requirement: Starred screen supports search
**Reason**: Search is handled by the shared SearchFab in PhotosList, which works in both feed modes.
**Migration**: No migration needed; search functionality continues to work in bookmarks mode.

### Requirement: Bookmarks screen footer with drawer menu and camera buttons
**Reason**: The standalone Bookmarks screen no longer exists.
**Migration**: PhotosListFooter is already rendered in PhotosList and continues to be shown in both modes.

### Requirement: Photo viewing in bookmarks
**Reason**: Inline expansion is already handled by PhotosList in both modes.
**Migration**: No migration needed; inline expansion works identically in both feed modes.
