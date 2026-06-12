---
name: hybrid-wave-strip-pagination
description: Hybrid pagination fix for WavePhotoStrip horizontal scroll
status: proposal
---

# Hybrid Wave PhotoStrip Pagination

## Why

WavePhotoStrip horizontal photo strips in WaveCards on the Waves list load only initial photos (0–5 from `listWaves` inline). When the user scrolls right, the first page fetches correctly, but subsequent scrolling doesn't load more photos. The root causes are:

1. **Stranded scroll position**: When `onEndReached` fires and fetches complete, new photos are appended and content grows longer, but the user's scroll position stays put — they're no longer at the end threshold. They must scroll all the way back to the start and then to the end again.
2. **Aggressive threshold**: `onEndReachedThreshold={0.5}` means `onEndReached` fires when only half the visible area has been scrolled — barely any scroll needed for the first page.
3. **No auto-jump**: After photos load, the FlatList doesn't scroll to keep the user near the end, so they can continue loading seamlessly.

This creates a poor UX where the first page loads but further scrolling appears broken.

## What Changes

- Modify `WavePhotoStrip` to use a hybrid approach: keep `onEndReached` as the primary trigger but add auto-scroll-to-end after photos load
- Increase `onEndReachedThreshold` from `0.5` to `0.1` so it fires only when truly at the end
- Use `flatListRef.current.scrollToEnd({ animated: true })` after photos are appended to keep the user in the "load more" zone
- Add a debouncing guard to prevent double-fires during the brief window between fetch completion and auto-scroll

## Impact

- `src/components/WavePhotoStrip/index.js` — Hybrid pagination logic (auto-scroll + threshold adjustment)

No API or state management changes required.
