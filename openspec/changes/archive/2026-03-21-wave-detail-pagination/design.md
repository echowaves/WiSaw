## Context

`PhotosListMasonry` is a shared masonry grid component used by three screens: PhotosList (main feed), WaveDetail, and PhotoSelectionMode. It accepts an `onEndReached` prop but its internal `onEndReached` handler ignores it — instead it directly calls `setPageNumber()` to increment the page counter.

This works for PhotosList because PhotosList has a `useEffect` watching `pageNumber` that triggers data fetches. But WaveDetail relies on its `handleLoadMore` callback (passed as `onEndReached`) to call `loadPhotos()` directly — since the prop is never invoked, the page number increments silently and no network request is made.

## Goals / Non-Goals

**Goals:**
- Make `PhotosListMasonry` call the `onEndReached` prop when provided, so parent screens can control their own fetch logic
- Ensure WaveDetail paginates correctly when the user scrolls to the bottom
- Maintain backward compatibility with PhotosList and PhotoSelectionMode

**Non-Goals:**
- Refactoring PhotosList to use the `onEndReached` prop pattern (it can continue using `setPageNumber` + `useEffect`)
- Adding pull-to-refresh or infinite scroll indicators (these already exist)
- Changing the GraphQL query or page size

## Decisions

### Decision 1: Call `onEndReached` prop when provided, fall back to `setPageNumber`

Modify `PhotosListMasonry`'s internal `onEndReached` handler to check if the `onEndReached` prop is provided. If so, call it and skip the internal `setPageNumber` call (the parent's handler already manages page state). If not, fall back to the existing `setPageNumber` behavior.

**Why over alternatives:**
- *Alternative A: Have all screens use the `onEndReached` prop pattern* — requires refactoring PhotosList, which is complex and out of scope.
- *Alternative B: Add a `useEffect` in WaveDetail watching `pageNumber`* — adds a redundant state-driven fetch loop when the direct callback pattern is cleaner and already implemented in `handleLoadMore`.

### Decision 2: Keep guard conditions in both layers

The `onEndReached` handler in `PhotosListMasonry` already checks `!loading && !stopLoading`. WaveDetail's `handleLoadMore` checks `!noMoreData && !loading`. Both guards remain — the masonry guard prevents rapid-fire calls, and the parent guard prevents fetching past the end.

## Risks / Trade-offs

- [Risk: Double-guard could mask bugs] → Both layers log/are debuggable; the alternative (single guard) risks over-fetching.
- [Risk: PhotoSelectionMode may also need `onEndReached` prop] → PhotoSelectionMode already passes `onEndReached` but also passes `setPageNumber`. After this fix it will use the prop path, which is correct since its `handleLoadMore` (like WaveDetail's) calls `loadPhotos` directly.
