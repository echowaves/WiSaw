## Context

WavesHub currently has three event subscription paths that react to backend mutations:
- **Auto-group completion** → `fetchCounts()` only (badge numbers update, list stale)
- **Upload to wave** → `fetchCounts()` only (badge numbers update, wave photos stale)
- **Upload ungrouped** → no subscription (photo disappears from main feed but never appears in WavesHub ungrouped view)

All three paths should trigger a full reload (`handleRefresh()`) to show fresh wave data, photos, and counts.

## Goals / Non-Goals

**Goals:**
- Full waves list reload after auto-group, upload-to-wave, and upload-ungrouped
- All three refresh paths share the same `handleRefresh()` call for consistency
- No visual jank — loading state already handled by `handleRefresh()`'s spinner

**Non-Goals:**
- No surgical/local state updates (e.g., prepending a single wave or photo thumb)
- No debouncing or batching of refresh events
- No new hooks, components, or context — purely WavesHub logic changes

## Decisions

| Decision | Rationale |
|----------|-----------|
| Call `handleRefresh()` for all three events | Single source of truth — the refresh logic lives in one place, impossible to diverge |
| No debouncing or batching | Simpler code; `listWaves` already uses `fetchPolicy: 'network-only'`; race conditions handled by `stopLoading` guard and new `batch` UUID |
| No visual differentiation (all show spinner) | User triggered auto-group → spinner expected. Upload → user just tapped "upload", spinner is acceptable |
| No new state or local mutations | Full reload from backend is the single source of truth — no need for optimistic/local updates |

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Multiple rapid uploads → multiple full reloads | `handleRefresh` resets pagination and batch each time; `stopLoading` guard prevents concurrent requests; network-only policy ensures freshness |
| Auto-group + upload race condition | Same guard — second `handleRefresh` waits for first to finish |
| User navigates away during in-flight refresh | Effect cleanup from `useEffect` unsubscribes bus listeners; in-flight request may complete but component unmounted — React handles this gracefully |

## Open Questions

- None — scope is clear: three `useEffect` subscriptions → call `handleRefresh()` instead of `fetchCounts()`
