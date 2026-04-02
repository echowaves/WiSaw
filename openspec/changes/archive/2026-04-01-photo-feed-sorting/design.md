## Context

The waves list already supports sorting via a kebab menu with 4 options (Updated/Created × Newest/Oldest). The sort state is stored in jotai atoms (`waveSortBy`, `waveSortDirection`) and persisted via `saveWaveSortPreferences()` to SecureStore. The `listWaves` query passes these as variables.

However, the individual photo feed screens (`WaveDetail`, `FriendDetail`) don't support sorting — they always fetch in server default order. Both backend queries (`feedForWave`, `feedForFriend`) already accept `sortBy` and `sortDirection` parameters.

## Goals / Non-Goals

**Goals:**
- Add sort controls to both `WaveDetail` and `FriendDetail` kebab menus
- Pass sort params to the respective GraphQL queries
- Persist sort preferences per feed type
- Re-fetch when sort changes

**Non-Goals:**
- Changing the waves list sort (already works)
- Adding search to photo feeds (separate concern)
- Per-wave or per-friend sort preferences (use a shared preference per feed type)

## Decisions

### Decision 1: Shared sort preference per feed type, not per entity

**Choice**: One sort preference for all wave feeds and one for all friend feeds — not per-waveUuid or per-friendUuid.

**Rationale**: Simpler state model. Users typically want consistent sorting across all feeds. Matches how the waves list sort works (one preference for the entire list).

### Decision 2: Sort options match existing waves list pattern

**Choice**: Use the same 4 sort options as the waves list: `createdAt`/`updatedAt` × `asc`/`desc`.

**Rationale**: Consistent UX. The backend supports these fields for both `feedForWave` and `feedForFriend`.

### Decision 3: Append sort items to existing kebab menus

**Choice**: Add a separator + sort options below the existing menu items in each screen's kebab `ActionMenu` (same pattern as `app/(drawer)/waves/index.tsx`).

**Rationale**: No new UI component needed. The pattern is already proven in the waves list header.

## Risks / Trade-offs

- [Sort change triggers full re-fetch] → Expected behavior. Reset pagination, new batch, re-fetch from page 0 with new sort params. Same pattern as waves list sort.
