## Context

`PhotosList/index.js` uses `useFeedSearch` hook which exposes `searchTerm` and `setSearchTerm`. The SearchFab component calls `setSearchTerm` on every `onChangeText` keystroke and `submitSearch` (which calls `onSearch` → `reload`) only when the send button is pressed.

However, a `useEffect` in `PhotosList/index.js` at line ~309 has `searchTerm` as a dependency:

```js
useEffect(() => {
  if (netAvailable && uuid) {
    reload(searchTerm)
  }
}, [isBookmarksMode, searchTerm])
```

This was intended to reload the feed when the mode toggle changes (passing the current search term), but it also fires on every keystroke because `searchTerm` is a dependency.

## Goals / Non-Goals

**Goals:**
- Search API calls only fire on explicit user action (send button press)
- Mode toggle still reloads with the current search term
- External triggers (AI tag clicks, deep links) still work correctly

**Non-Goals:**
- Adding debounce to search input (not needed — explicit submit is the right model)
- Changing SearchFab component behavior
- Modifying the `useFeedSearch` hook

## Decisions

- **Remove `searchTerm` from the useEffect dependency array**. The effect's purpose is to reload on mode toggle. The current `searchTerm` value is captured in the closure at the time the mode changes. Removing it from deps means the effect only fires when `isBookmarksMode` changes, which is the intended behavior.

## Risks / Trade-offs

- **Stale closure risk**: If `searchTerm` is removed from deps, the closure captures the value at the time the effect runs. Since the effect only runs on `isBookmarksMode` change (a user tap), the closure will have the current `searchTerm` from that render — this is correct behavior.
- **No risk to external triggers**: `useFeedSearch` handles AI tag clicks and deep links by calling `onSearch` directly, bypassing this effect entirely.
