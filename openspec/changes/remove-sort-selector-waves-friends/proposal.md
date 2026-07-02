## Why

The sort selector adds UI complexity for minimal user value. Both Waves and Friends lists are short (<50 items), and users expect "what you see is what you got" ordering — newest first by creation date. Removing the sort picker simplifies the header, reduces state, and eliminates an entire code path.

## What Changes

- **Remove the sort picker button** from both Waves Hub and Friends List headers
- **Remove the SortOrderPicker modal** from both screens
- **Remove all sort state management** (Jotai atoms: `waveSortBy`, `waveSortDirection`, `friendsSortBy`, `friendsSortDirection`)
- **Remove sort logic** from both screens (client-side sort branches, sort options arrays, sort change handlers)
- **Fix default sort to `createdAt` descending** (newest first) — applied client-side after data fetch
- **Strip `sortBy`/`sortDirection` from backend `listWaves` call** — backend will be updated separately
- **Remove sort atoms from `app/_layout.tsx`** — two stub `useAtom` calls no longer needed

## What Does NOT Change

- Pending friends still pinned to top of Friends List
- Search still works identically
- All other header buttons (Add Friend / Select) remain
- Wave photo upload, merge, and sharing flows unaffected
- Friends List action menus (Edit Name, Remove, Share) unaffected
- `waveFeedSortBy`/`friendFeedSortBy` atoms untouched (these are for feed screens, not list screens)

## Capabilities

### Modified Capabilities
- `friends-sort` — remove sort options, fix to `createdAt` desc
- `wave-sort-persistence` — remove atoms and sort logic (this capability is being retired)
- `waves-list-sort` — remove atoms and sort logic (this capability is being retired)

## Impact

| File | Change |
|------|--------|
| `src/screens/WavesHub/index.js` | Remove SortOrderPicker, sort state, sort button, sort logic, sort params from loadWaves |
| `src/screens/WavesHub/reducer.js` | No changes (delegates to `../Waves/reducer` which handles the backend call — but `loadWaves` no longer passes sort params) |
| `src/screens/FriendsList/index.js` | Remove SortOrderPicker, sort state, sort button, sort logic, sort options |
| `src/state.js` | Remove `waveSortBy`, `waveSortDirection`, `friendsSortBy`, `friendsSortDirection` atoms |
| `app/_layout.tsx` | Remove two stub `useAtom` calls for sort state |
| `openspec/specs/friends-sort/spec.md` | Rewrite to reflect fixed sort order |
| `openspec/specs/wave-sort-persistence/spec.md` | Remove or mark as retired (if exists) |
| `openspec/specs/waves-list-sort/spec.md` | Remove or mark as retired (if exists) |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Users who preferred alphabetical sort lose that option | Trade-off accepted: sort was rarely used, `createdAt` desc is more intuitive for "what's new" |
| Backend still expects `sortBy`/`sortDirection` params (removed from frontend call) | Backend change in separate thread — frontend call no longer sends these fields |
| `recentPhoto` sort key no longer sent to backend | Backend change in separate thread — it won't receive `sortBy: 'recentPhoto'` anymore |
| Existing users with saved sort preferences (if persisted) — none found, state was Jotai session-only | No migration needed |
