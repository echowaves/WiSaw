## Why

The SearchFab's magnifying glass icon currently stays anchored on the left when the search bar expands. This places the submit action at the left edge — the opposite end from where the user's attention is (the text input and clear button on the right). Moving the submit button to the right side of the expanded bar and changing it to a send icon provides a clearer call-to-action aligned with the user's reading direction and input flow. The clear (✕) button should only appear when there is text to clear.

## What Changes

- When the FAB expands into a search bar, the FAB button animates from the left edge to the right edge of the bar
- The collapsed FAB displays a magnifying glass icon (unchanged)
- The expanded FAB displays a send icon (right side) as the submit action
- The ✕ clear button only appears when the input text is non-empty
- Tapping the send button submits the search; the bar stays expanded
- Tapping ✕ clears the text, collapses the bar, and returns the FAB to the left with a magnifying glass icon
- The bar's internal padding flips: collapsed has left padding for the FAB, expanded has right padding for the FAB

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `search-fab`: FAB button position changes from left-anchored to animated left→right on expand; icon changes from magnifying glass to send when expanded; ✕ clear button only visible when input has text

## Impact

- `src/components/SearchFab/index.js` — Animate FAB `translateX` from 0 to `expandedWidth - FAB_SIZE` based on progress; swap `paddingLeft`/`paddingRight` on the bar; change expanded icon from `search` to `send`; conditionally show ✕ only when `searchTerm.length > 0` (already the case, no change needed for ✕ visibility)
