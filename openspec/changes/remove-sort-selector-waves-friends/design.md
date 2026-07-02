## Context

Both Waves Hub and Friends List have independent sort implementations managed via Jotai atoms. The sort picker is a header button that opens a SortOrderPicker modal. Each screen has its own sort options, handler, and client-side sort logic.

**Current architecture:**

```
┌──────────────────────────────────────────────────────────────┐
│                     CURRENT STATE                            │
├──────────────────────────┬───────────────────────────────────┤
│ Waves Hub                │ Friends List                      │
├──────────────────────────┼───────────────────────────────────┤
│ Header: [Select] [Sort]  │ Header: [+Add] [Sort]            │
│                          │                                   │
│ sortPickerVisible: bool  │ sortPickerVisible: bool          │
│ waveSortBy: 'name'       │ friendsSortBy: 'alphabetical'    │
│ waveDir: 'asc'           │ friendsDir: 'asc'                │
│                          │                                   │
│ loadWaves → { sortBy,    │ No backend sort params           │
│   sortDirection }        │                                   │
│                          │                                   │
│ filteredWaves → sort by  │ sortedAndFilteredFriends → sort  │
│   name (client) or       │   by alphabetical (client) or    │
│   recentPhoto (server)   │   updatedAt (client)             │
└──────────────────────────┴───────────────────────────────────┘
```

**State atoms (to be removed):**
- `STATE.waveSortBy` (default `'name'`)
- `STATE.waveSortDirection` (default `'asc'`)
- `STATE.friendsSortBy` (default `'alphabetical'`)
- `STATE.friendsSortDirection` (default `'asc'`)

**Root layout (to be cleaned):**
`app/_layout.tsx` lines 58-59 have unused `useAtom` calls for `waveSortBy`/`waveSortDirection` — these are dead references since `_layout.tsx` never reads the values, only sets them to initialize.

## Goals / Non-Goals

**Goals:**
- Remove sort picker UI from both screens
- Remove all sort-related state management
- Fix default sort to `createdAt` descending on both screens
- Strip sort params from backend `listWaves` call
- Remove dead code (atoms, handlers, sort branches)
- Update specs to reflect new reality

**Non-Goals:**
- No backend changes (handled in separate thread)
- No changes to `waveFeedSortBy`/`friendFeedSortBy` (feed screens, not list screens)
- No changes to pending friend pinning logic
- No changes to search functionality

## Decisions

### Decision 1: Remove atoms entirely

**Choice**: Delete `waveSortBy`, `waveSortDirection`, `friendsSortBy`, `friendsSortDirection` from `src/state.js`.

**Rationale**: No other code references these atoms except the two screens and two dead references in `_layout.tsx`. After removing those references, the atoms are truly orphaned and should be deleted to prevent confusion.

**Alternatives considered**:
- Keep atoms with hardcoded `'createdAt'`/`'desc'` defaults → No benefit, adds dead weight

### Decision 2: Fixed `createdAt` descending sort

**Choice**: Both screens sort by `createdAt` descending (newest first), applied client-side after data fetch.

**Rationale**:
- `createdAt` is available on both wave objects and friendship objects
- `createdAt` desc = "what's newest" which is the most intuitive default
- Client-side sort is acceptable because both lists are small (<50 items)
- Backend changes (removing `sortBy`/`sortDirection` params) are in a separate thread

**Waves**: `loadWaves` no longer passes `sortBy`/`sortDirection`. Waves are sorted client-side in `filteredWaves` by `createdAt` desc.

**Friends**: `sortedAndFilteredFriends` sorts confirmed friends by `createdAt` desc. Pending friends still pinned to top.

### Decision 3: Strip sort from `listWaves` call

**Choice**: Remove `sortBy` and `sortDirection` from the `reducer.listWaves()` call in `src/screens/WavesHub/index.js`.

**Rationale**: Backend is being updated separately to stop expecting these params. Removing them from the frontend call now ensures we don't send stale params that the backend will reject.

**Alternatives considered**:
- Leave params in call → Backend would need to handle missing params gracefully, but it's cleaner to not send them

### Decision 4: Remove SortOrderPicker component import

**Choice**: Remove the `import SortOrderPicker` line from both screen files.

**Rationale**: If the SortOrderPicker is no longer used by either screen, the import is dead code.

**Note**: If SortOrderPicker is used elsewhere (e.g., other screens), we only remove the import from these two files. (Current grep shows it's only imported in WavesHub and FriendsList.)

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Backend `listWaves` still expects `sortBy`/`sortDirection` params | Backend change in separate thread; frontend no longer sends them |
| Users who preferred A-Z or Z-A sort | Trade-off accepted; `createdAt` desc is more useful for "what's new" |
| `recentPhoto` backend sort key no longer sent | Backend change in separate thread |
| Dead `recentPhoto` fallback sort in backend (if it exists) | Not our concern; handled separately |

## Migration Plan

No migration needed. State was Jotai session-only (no persistence). Removing atoms and UI is a pure removal — no data transformation required.
