## Context

`useFeedLoader` manages pagination, abort control, and result merging for all feed screens. When `reload()` is called with a search term, it passes the term to `load()` as `searchTermOverride`. However, `handleLoadMore()` calls `load()` with `null` for `searchTermOverride`, and since `getFetchParams()` doesn't include `searchTerm`, the paginated request goes to the API without a search term — returning unfiltered results that get merged into the search results.

## Goals / Non-Goals

**Goals:**
- Paginated requests preserve the active search term
- Fix is internal to `useFeedLoader` — no call-site changes needed
- Clearing search (reload with `''`) properly resets the stored term

**Non-Goals:**
- Changing the search UI or `useFeedSearch` hook
- Modifying `getFetchParams()` in consumers
- Adding search term to the `handleLoadMore` function signature

## Decisions

### 1. Store search term in a ref inside `useFeedLoader`

**Rationale**: A ref (`searchTermRef`) persists the search term across renders without causing re-renders. `reload()` writes to it, `handleLoadMore()` reads from it. This makes the hook self-contained — no caller needs to remember to pass the search term through.

**Alternative**: Include `searchTerm` in `getFetchParams()` at each consumer. Rejected — fragile, requires every consumer to correctly wire it, and the hook already receives the search term via `reload()`.

### 2. `handleLoadMore` reads from the ref, not from caller args

**Rationale**: The ref always reflects the most recent search context established by the last `reload()`. This is correct because pagination should always continue the current feed context, whether that's a search or unfiltered.

## Risks / Trade-offs

- [Stale ref after unmount] → Not a concern: the ref is scoped to the hook instance which is destroyed on unmount. The abort controller already prevents stale updates.
