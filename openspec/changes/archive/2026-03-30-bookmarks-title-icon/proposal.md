## Why

The Bookmarks screen header displays only the text "Bookmarks" without a visual icon. Other screens use icons to reinforce context. Adding a bookmark icon to the header title improves visual consistency and makes the screen instantly recognizable.

## What Changes

- Pass a `React.ReactNode` title to `AppHeader` on the Bookmarks screen that includes an Ionicons `bookmark` icon alongside the "Bookmarks" text
- The icon should match the drawer's existing `bookmark` icon (Ionicons, size appropriate for inline header use)
- The icon color should match the header text color (`theme.TEXT_PRIMARY`)

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `starred-screen`: Header title changes from plain text "Bookmarks" to an icon+text combination

## Impact

- `src/screens/BookmarksList/index.js` — update the `title` prop on all `AppHeader` instances from a string to a JSX element containing an Ionicons bookmark icon and text
