## Purpose
This specification has been superseded. The Bookmarks drawer item is removed entirely. The `bookmarksCount` atom and `getBookmarksCount` function are retained for other consumers (WaveHeaderIcon). Bookmarks mode is now toggled via the FeedModeToggleFAB (see `feed-mode-toggle` capability).

## Requirements

(All requirements removed in `consolidate-bookmarks-into-landing`. The `bookmarksCount` atom and `getBookmarksCount` function remain for WaveHeaderIcon.)

### Requirement: Bookmarks drawer icon color reflects bookmark state
**Status**: REMOVED. Bookmarks drawer item removed entirely.
### Requirement: Bookmarks count global atom
**Status**: RETAINED (not removed). `bookmarksCount` atom still used by WaveHeaderIcon.
### Requirement: Bookmarks count reducer function
**Status**: RETAINED (not removed). `getBookmarksCount` function still used by WaveHeaderIcon.
