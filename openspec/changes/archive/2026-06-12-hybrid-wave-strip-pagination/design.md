# WavePhotoStrip Hybrid Pagination — Design

## Context

`WavePhotoStrip` renders a horizontal `FlatList` of photo thumbnails (80x80 each). Each card shows 0–5 initial photos from `listWaves`. When the user scrolls right, `onEndReached` triggers a fetch for the next page via `fetchFn`. The current implementation works for the first page but fails for subsequent loads because:

1. New photos are appended → content grows → user's scroll position is no longer at the end
2. No auto-scroll keeps the user in the "load more" zone
3. The `0.5` threshold combined with small content widths means it fires too eagerly on initial load

## Goals

- Make horizontal photo strips feel like a continuous infinite scroll
- No manual back-and-forth scrolling required
- Don't interrupt users who are browsing existing photos
- No new dependencies
- Backward compatible with existing `onPhotoPress`/`onPhotoLongPress` callbacks

## Decisions

### 1. Auto-scroll with `animated: false` after photos load

When photos are successfully fetched and appended, call `flatListRef.current.scrollToEnd({ animated: false })` to instantly position the user at the new end.

**Why `false` over `true`?** Smooth animation creates a "marching content" effect where photos slide while the user tries to tap one. Instant reposition is less jarring and doesn't interfere with photo interactions.

### 2. Keep `onEndReachedThreshold={0.5}`

The current `0.5` threshold is fine for the pagination use case. With auto-scroll keeping users at the end, the threshold will fire predictably. No need to adjust it.

### 3. Skip auto-scroll on first load when strip was previously empty

When the strip mounts with 0 initial photos and `fetchFn` is provided, the first `onEndReached` fires immediately (content offset is 0). Auto-scrolling in this case causes a visual jump from empty state to populated state.

**Guard:** Track whether the internal `photos` state had any items before the current fetch. Only auto-scroll if `prevPhotos.length > 0`.

```js
// Track before fetch
const hadPhotosBefore = photos.length > 0

// After fetch completes and photos are appended:
if (hadPhotosBefore) {
  flatListRef.current?.scrollToEnd({ animated: false })
}
```

### 4. Use `flatListRef` via `ref` prop on FlatList

The `WavePhotoStrip` component currently has no ref to the FlatList. We need to add one so we can call `scrollToEnd`. We'll use `React.forwardRef` or a `useRef` + `ref` prop approach.

Since `WavePhotoStrip` is used as a class-style functional component without refs currently, we'll use a simple `useRef` and pass it to the FlatList.

### 5. Debounce auto-scroll to prevent race conditions

After `scrollToEnd({ animated: false })` fires, if `onEndReached` fires again before the new photos have been appended, it could trigger a double-fetch. The existing `stopLoading.current` guard already prevents this — we don't need an additional debounce layer.

The guard chain works as follows:

```
Scroll → onEndReached fires → check stopLoading.current
  ├─ false → set stopLoading.current = true → fetch → append photos → scrollToEnd
  └─ true → early return (fetch in progress)
```

When `scrollToEnd` fires, the user is now further right. If they haven't scrolled back, `onEndReached` won't fire again until they do. And if they scroll back while a fetch is in progress, the `stopLoading.current` guard prevents double-fetch.

## Architecture

```
WavePhotoStrip
├─ useRef for FlatList ref
├─ useRef for "had photos before fetch" guard
├─ handleLoadMore (existing, with stopLoading guard)
│   ├─ save prev photos count before fetch
│   ├─ fetch via fetchFn(pageNumber, batch)
│   ├─ append photos (deduplicated)
│   ├─ if hadPhotosBefore → scrollToEnd({ animated: false })
│   └─ reset stopLoading guard
└─ FlatList
    ├─ ref={flatListRef}
    ├─ onEndReached={handleLoadMore}
    └─ onEndReachedThreshold={0.5} (unchanged)
```

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Auto-scroll breaks photo tap/cancel | User tries to tap a photo, auto-scroll fires, cancels the tap | `animated: false` means no visual movement during tap; only fires after photos are fully fetched |
| Auto-scroll on first load jumps UI | Strip goes from empty placeholder to populated, auto-scroll jumps position | Guard: only auto-scroll when `prevPhotos.length > 0` |
| FlatList ref not available on render | Ref might be undefined during first render | Use optional chaining: `flatListRef.current?.scrollToEnd(...)` |
| Auto-scroll interferes with long-press | User long-presses a photo, auto-scroll fires before gesture completes | Auto-scroll only fires after fetch completes (async), well after the gesture would have fired |
