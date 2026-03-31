## Why

The Bookmarks screen currently has no footer navigation bar, leaving users without quick access to the drawer menu or camera functionality. The home feed (PhotosList) already has a footer with a drawer menu button and camera buttons, but this is absent when viewing bookmarks, creating an inconsistent experience.

## What Changes

- Add `PhotosListFooter` to the Bookmarks screen with drawer menu and camera buttons
- Wire up `UploadContext` and `useCameraCapture` hook to enable photo/video capture from the bookmarks screen
- Read `locationAtom` for the footer's `locationReady` visual state
- Increase `FOOTER_HEIGHT` from 20 to 90 to accommodate the footer bar
- Keep the existing `AppHeader` with back button unchanged

## Capabilities

### New Capabilities

(none)

### Modified Capabilities
- `starred-screen`: Adding footer bar with drawer menu and camera buttons to the bookmarks screen layout

## Impact

- `src/screens/BookmarksList/index.js` — add imports, hook wiring, footer rendering in all 4 return paths
- No new dependencies — all required components and hooks already exist
