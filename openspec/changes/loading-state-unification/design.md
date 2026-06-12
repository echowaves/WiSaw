## Context

Loading state is managed in 7+ screens with duplicated `setLoading(true/false)` boilerplate inside try/catch/finally blocks. The codebase has accumulated inconsistent naming: `isRefreshing` (FriendsList), `refreshing` (WavesHub), `loadingRef` (WavesHub, WavePhotoStrip), `stopLoading` (feed screens), `loadingMore` (WaveSelectorModal) all serve related but different purposes. There is no single source of truth for how loading state should be managed.

## Goals / Non-Goals

**Goals:**
- Extract `useSimpleFetch` hook for the 7 most repetitive screens (3 pure-fetch + 4 mutation handlers)
- Unify naming across existing screens to a single standard vocabulary
- Document the naming standard for future reference

**Non-Goals:**
- Refactoring `useFeedLoader` (already well-designed, out of scope)
- Refactoring WaveDetail/FriendDetail pagination logic (would require a separate, larger change)
- Converting any files to TypeScript
- Adding new error handling strategies

## Decisions

### Decision 1: `useSimpleFetch` returns `{ loading, execute }` for actions, `{ data, loading, execute }` for fetches

**Rationale:** Action handlers (join, merge, share) don't need the fetched `data` — they just need to know if something is in-flight. Pure fetch screens need `data`. The hook will accept an options object to control this.

```javascript
// Pure fetch
const { data, loading, execute } = useSimpleFetch(fetchFn, deps)
useEffect(() => { execute() }, [execute])

// Action handler
const { loading, execute } = useSimpleFetch(actionFn, deps)
// execute() is called from onPress handlers
```

### Decision 2: Hook does NOT auto-handle errors

**Rationale:** Different screens have different error handling needs. WaveModeration shows error toasts; WaveSettings silently fails; join.tsx shows custom toast + navigation. Auto-handling would either be too specific or too generic. The hook sets an `error` field but doesn't touch the UI.

### Decision 3: Use `loadingRef` (useRef) for concurrent fetch guard, `loading` (useState) for UI

**Rationale:** WavesHub already does this correctly. `useState` causes re-renders — using it for a race guard is wasteful. `useRef` is the correct primitive for a guard that only the code reads, not the template. However, the UI spinner needs `useState` because it triggers a re-render.

### Decision 4: Naming standard — one word per concept

| Concept | Variable name | Type | Purpose |
|---------|--------------|------|---------|
| Fetch in-flight | `loading` | `useRef` | Race guard — `if (loadingRef.current) return` |
| UI spinner | `loading` | `useState` | Shows/hides activity indicator |
| RefreshControl | `refreshing` | `useState` | Passed to `RefreshControl` |
| Pagination exhausted | `stopLoading` | `useState` | Hides "load more" triggers |
| No more pages | `noMoreData` | `useState` | Business logic — no more pages to load |

### Decision 5: Migrate FriendsList `isRefreshing` → `refreshing`

**Rationale:** FriendsList uses `isRefreshing` for the RefreshControl but `loading` for the fetch guard. This is the only screen with this split. Unifying to `refreshing` eliminates confusion and matches the standard.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| `useSimpleFetch` may not cover edge cases in the 4 mutation screens | Each screen is migrated individually with manual review |
| Renaming `isRefreshing` → `refreshing` in FriendsList could miss a reference | Search for all `isRefreshing` usages, verify each one |
| Hook adds indirection for simple screens | The indirection removes ~15 lines of boilerplate per screen — net positive |

## Migration Plan

1. Create `src/hooks/useSimpleFetch.js` (new file)
2. Migrate each of the 7 screens one at a time (verify visual output after each)
3. Rename `isRefreshing` → `refreshing` in FriendsList
4. Verify all `setLoading(true/false)` patterns in the 7 screens are gone
5. Add naming standard comment in the hook file for future reference

## Open Questions

None at this time.
