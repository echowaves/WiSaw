## Why

When typing in the search field, the search query is submitted to the API on every keystroke instead of waiting for the user to explicitly press the send button. This causes unnecessary API calls, flickering results, and a poor user experience.

## What Changes

- Remove `searchTerm` from the `useEffect` dependency array in `PhotosList/index.js` so the feed no longer auto-reloads on every character typed
- Search reloads only when the user explicitly clicks the send button (`submitSearch`) or when the feed mode toggle changes (global ↔ starred)

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `search-fab`: Search input should update the text field without triggering an API call; API call only fires on explicit send button press

## Impact

- `src/screens/PhotosList/index.js`: one-line change to `useEffect` dependency array
- No API changes, no new dependencies, no UI changes
