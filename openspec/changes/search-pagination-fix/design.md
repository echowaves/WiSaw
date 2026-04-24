## Context

`useFeedLoader` is the shared pagination hook used by all feed screens. Its `load()` function fetches a page, appends results, and sets `loading = false`. The parent's `handleLoadMore` relies on VirtualizedList's `onEndReached` callback to trigger the next page.

In column-mode masonry, VirtualizedList wraps items into "bands" (~300px tall). With search results (often sparse — 1-7 photos per page), total content is shorter than the viewport. VirtualizedList's `onEndReached` fires once during the initial layout, but subsequent data appends don't re-trigger it due to a timing issue: `_onContentSizeChange` runs before `componentDidUpdate` can reset `_hasDataChangedSinceEndReached`.

The `load()` function already has a recursive auto-page path for **empty** search responses (line 81-86 of useFeedLoader.js): when `photos.length === 0 && searchTerm && nextPage != null`, it calls `load()` recursively with `nextPage`. This works because the API often returns empty pages between pages containing tagged photos. The fix extends this pattern to **all** search responses where `noMoreData` is `false`.

## Goals / Non-Goals

**Goals:**
- Make search mode load all available results without depending on `onEndReached`
- Reuse the existing auto-page pattern (recursive `load()` with abort signal)
- Maintain backward compatibility for non-search pagination (still driven by `onEndReached`)

**Non-Goals:**
- No changes to the VirtualizedList or expo-masonry-layout library
- No changes to non-search pagination behavior (which works fine via scroll-triggered `onEndReached`)
- No changes to the API response shape or batch logic

## Decisions

### Extend auto-page to non-empty search responses

**Choice**: After `load()` appends photos to the list in search mode, check `!noMoreData && nextPage != null && effectiveSearchTerm.length > 0`. If true, recursively call `load(fetchParams, effectiveSearchTerm, signal, nextPage)`.

**Why**: This unifies the two search-mode branches (empty response auto-page and non-empty response) into the same continuation pattern. The abort signal already prevents runaway chains. The batch ID check already prevents stale appends.

**Alternative considered**: Fix VirtualizedList's `onEndReached` timing by adding a `setTimeout` to force re-evaluation after data changes. Rejected — it's fragile, depends on internal VirtualizedList timing, and wouldn't work reliably across RN versions.

**Alternative considered**: Call `handleLoadMore` from the masonry's `onLayout` callback when content is shorter than the viewport. Rejected — requires plumbing layout measurements through multiple layers and introduces a coupling between layout and data loading.

## Risks / Trade-offs

- **[Network load]** Auto-paging all search results means more rapid sequential requests. → Acceptable because search results are typically finite (a few hundred photos at most), each request is fast, and the abort signal stops the chain if the user navigates away or starts a new search.
- **[Stale closure risk in recursive load]** The recursive `load()` captures `fetchParams` from the initial call. → Safe because `fetchParams` (location, uuid) doesn't change during a search chain, and `searchTermOverride` is passed explicitly.
