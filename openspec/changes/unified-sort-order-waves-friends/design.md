## Context

Both Waves and Friends screens have independent sort implementations with different UI patterns and sort semantics, creating a fragmented user experience.

**Current State:**

```
Waves Hub:
  UI:  arrows mode (2 options: Updated, Created)
  Sort: updatedAt (default) or createdAt
  Atoms: STATE.waveSortBy, STATE.waveSortDirection

Friends List:
  UI:  segmented mode (3 options: A-Z, Z-A, Recent)
  Sort: alphabetical (asc/desc) or recentlyAdded (createdAt)
  Atoms: STATE.friendsSortBy, STATE.friendsSortDirection
```

Both use the shared `SortOrderPicker` component which already supports three modes: `segmented`, `grid`, and `arrows`.

## Goals / Non-Goals

**Goals:**
- Unified sort UI (arrows mode) across both screens
- Consistent sort options: A-Z and Recent
- "Recent" sorts by `updatedAt` (not `createdAt`)
- Remove `createdAt` sort from both screens
- Preserve existing Jotai atom pattern for state management

**Non-Goals:**
- No changes to SortOrderPicker component itself (already supports arrows mode)
- No changes to state atom structure or defaults
- No changes to server-side GraphQL queries beyond adding name sort
- No changes to pending-friend pinning logic

## Decisions

### Decision 1: Use arrows mode for both screens

**Choice**: Both screens will use `mode="arrows"` in SortOrderPicker.

**Rationale**: Arrows mode provides the clearest visual indication of sort direction (▲ for asc, ▼ for desc). The segmented mode lacks directional indicators, and grid mode is overly verbose for two options.

**Alternatives considered**:
- Segmented mode: No direction indicators — users can't tell if A-Z or Z-A is active without reading the label
- Grid mode: Too much screen real estate for just 2 options

### Decision 2: Consolidate to two sort options (A-Z, Recent)

**Choice**: Replace the current 2-3 option sets with a unified pair: A-Z and Recent.

**Rationale**:
- Waves' "Updated" and Friends' "Recent (createdAt)" both express recency but use different fields — unifying on `updatedAt` is more useful (shows recently modified, not just recently created)
- A-Z/Z-A/Recent on Friends is redundant — A-Z and Recent are sufficient; Z-A is a direction toggle, not a first-class option
- Two options fit naturally in arrows mode without cluttering the UI

**Alternatives considered**:
- Keep three options (A-Z, Z-A, Recent): More verbose, Z-A is just the inverse of A-Z
- Keep current different option sets: Inconsistent UX between screens

### Decision 3: A-Z sorts by name with direction toggle

**Choice**: A-Z option sorts alphabetically ascending by default (▲), toggles to descending (▼) = Z-A.

**Rationale**:
- Friends: sort by `contact` field (the friendly name)
- Waves: sort by `name` field (wave name) — requires adding name sort to GraphQL query
- Direction toggle is built into SortOrderPicker arrows mode — clicking toggles asc↔desc

**Implementation for Waves**: The current GraphQL `listWaves` query passes `sortBy` and `sortDirection` to the server. Adding `"name"` as a valid sortBy value requires a backend change. For now, we'll sort by name client-side after receiving waves from the server, or we can add server-side name sort support.

**Decision on name sort**: Sort client-side for now. The waves are already fetched in a specific order; we'll apply name sorting on the client after the server returns paginated results. This avoids backend changes and is acceptable since wave lists are typically small (< 50 items per user).

### Decision 4: Recent sorts by updatedAt

**Choice**: "Recent" uses `updatedAt` for both screens.

**Rationale**:
- `updatedAt` reflects when content was last modified — more useful than `createdAt` which only shows when something was first added
- For Friends: `updatedAt` is available on the friendship object
- For Waves: `updatedAt` is already available on wave objects and is the current default sort

### Decision 5: Preserve Jotai atom pattern

**Choice**: Keep using separate atoms (`waveSortBy`/`waveSortDirection` and `friendsSortBy`/`friendsSortDirection`) with matching keys.

**Rationale**: No need to refactor state management. Both screens already use the same pattern. The atom keys will now use compatible values:
- `waveSortBy`: `'name'` (default) or `'updatedAt'`
- `friendsSortBy`: `'alphabetical'` (default) or `'updatedAt'`
- Both use `sortDirection`: `'asc'` or `'desc'`

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Waves name sort is client-side, may not respect pagination order | Wave lists are small (<50 items); client-side sort is acceptable |
| Removing "Z-A" as a standalone option may confuse power users who prefer Z-A as default | Direction toggle is intuitive: ▲ = A-Z, ▼ = Z-A. First click shows ▼ (Z-A), second returns ▲ (A-Z) |
| `updatedAt` may not exist on all friend objects (e.g., pending friendships) | `updatedAt` falls back gracefully; if missing, defaults to 0 (appears at bottom in desc mode) |
| Existing user sort preferences are lost | Preferences are stored per-screen and reset to sensible defaults (A-Z ▲, Recent ▲) |

## Migration Plan

1. Update sort options in both screens
2. Change FriendsList mode from `"segmented"` to `"arrows"`
3. Update sort logic: use `updatedAt` instead of `createdAt` for "recent"
4. Add client-side name sort for waves (no backend change needed)
5. Test both screens with all sort combinations
6. No database migration or API changes required

## Open Questions

- None identified. The SortOrderPicker arrows mode already implements the toggle behavior we need.