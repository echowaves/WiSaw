## Why

When users open the comment input box on a photo, the SearchFab (floating action button) remains visible and overlaps the keyboard's typing area, blocking the input experience. The FAB should disappear smoothly when comment editing is active and reappear when submission completes or the comment input is dismissed.

## What Changes

- Add `isCommentEditing` prop to SearchFab component
- When `isCommentEditing` is `true`, SearchFab fades out (opacity transition) and becomes unresponsive (`pointerEvents: 'none'`)
- When `isCommentEditing` is `false`, SearchFab fades back in
- Parent screens (PhotosList, BookmarksList) manage `isCommentEditing` state and pass it to SearchFab
- Photo component notifies parent when comment input opens/closes via `onCommentInputToggle` callback

## Capabilities

### New Capabilities
- `fab-visibility-control`: Dynamic show/hide of SearchFab based on comment editing state

### Modified Capabilities
<!-- None - this is a new capability -->

## Impact

- `src/components/SearchFab/index.js` — add `isCommentEditing` prop, fade animation
- `src/screens/PhotosList/index.js` — add state and callback, pass to SearchFab
- `src/screens/BookmarksList/index.js` — add state and callback, pass to SearchFab
- `src/components/Photo/index.js` — accept `onCommentInputToggle` prop, call on state change
