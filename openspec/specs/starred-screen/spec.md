## Purpose
This specification has been superseded. Bookmarks functionality is consolidated into the landing screen as a toggle FAB (see `feed-mode-toggle` capability). The standalone Bookmarks/Starred screen and drawer item are removed.

## Requirements

(All requirements removed in `consolidate-bookmarks-into-landing`. Bookmarks are now accessed via FeedModeToggleFAB on the landing screen.)

### Requirement: Starred screen accessible from drawer
**Status**: REMOVED. Drawer item removed; bookmarks via FAB toggle on landing screen.
### Requirement: Starred screen displays watched photos feed
**Status**: REMOVED. `feedForWatcher` query now called by PhotosList when `isBookmarksMode` is `true`.
### Requirement: Starred screen uses AppHeader
**Status**: REMOVED. Standalone Bookmarks screen no longer exists.
### Requirement: Starred screen empty state
**Status**: REMOVED. Empty state handled within PhotosList when `isBookmarksMode` is `true`.
### Requirement: Starred screen supports search
**Status**: REMOVED. Search handled by shared SearchFab in PhotosList.
### Requirement: Bookmarks screen footer with drawer menu and camera buttons
**Status**: REMOVED. PhotosListFooter already rendered in PhotosList for both modes.
### Requirement: Photo viewing in bookmarks
**Status**: REMOVED. Inline expansion handled by PhotosList in both modes.
### Requirement: Starred screen does not subscribe to upload events
**Status**: REMOVED. Standalone screen no longer exists.
### Requirement: Starred screen reloads on identity change
**Status**: REMOVED. Standalone screen no longer exists.
