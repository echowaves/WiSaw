## Context

Both the Friends and Waves screens have a "Recent" sort option that users expect to mean "sorted by most recently added photo." Currently:

- **Friends**: Client-side sort uses `friend.updatedAt` (the friendship creation timestamp) instead of the most recent photo's timestamp. The backend `getFriendshipsList.ts` already has a `recentPhoto` sort field with a working SQL subquery, but the frontend never passes it.
- **Waves**: Client-side sort uses `wave.updatedAt` (the wave record update timestamp) instead of the most recent photo's timestamp. The backend `listWaves.ts` already has a `recentPhoto` sort field, but the frontend passes `sortBy: 'updatedAt'` instead.

The photo data (`photos` array) is already fetched alongside each friend/wave record in the GraphQL responses, so the most recent photo date is available without additional queries.

## Goals / Non-Goals

**Goals:**
- Friends "Recent" sort uses the most recent photo's `updatedAt` (from the already-fetched `photos` array)
- Waves "Recent" sort delegates to backend `recentPhoto` sort field
- A-Z sorts remain unchanged (already correct)
- Pending friends remain pinned at top regardless of sort

**Non-Goals:**
- No backend changes required (both `recentPhoto` sort fields already exist)
- No persistence of sort preference across sessions (session-only via Jotai atoms)
- No changes to the SortOrderPicker component itself

## Decisions

### Decision 1: Friends "Recent" sort — client-side using existing photo data

**Choice**: Sort confirmed friends client-side using `photos[0]?.updatedAt` (the first element of the already-fetched photos array, which is ordered by `updatedAt DESC` from the backend).

**Rationale**:
- The backend `getFriendshipsList.ts` already fetches up to 5 most recent active photos per friend, ordered by `updatedAt DESC` (line 91: `ORDER BY "Photos"."updatedAt" DESC`)
- This data is already in the enhanced friendship object returned by `getEnhancedListOfFriendships`
- Avoids additional backend query complexity for a list that's typically small (< 100 friends)
- Consistent with the existing client-side sort architecture for friends

**Alternatives considered**:
1. Pass `sortBy: 'recentPhoto'` to backend — would work but adds complexity since the current frontend flow calls `getEnhancedListOfFriendships` which does its own client-side enrichment (contact names from SecureStore). Mixing backend sort with client-side enrichment could cause inconsistency.
2. Add a separate field to the enhanced friendship object — unnecessary; the `photos` array already contains the data needed.

### Decision 2: Waves "Recent" sort — backend delegation

**Choice**: Pass `sortBy: 'recentPhoto'` to the `listWaves` GraphQL query when the Recent sort is active, and disable client-side re-sorting for that case.

**Rationale**:
- The backend `listWaves.ts` already supports `recentPhoto` with a subquery:
  ```ts
  recentPhoto: '(SELECT MAX(p."updatedAt") FROM "WavePhotos" wp JOIN "Photos" p ON p."id" = wp."photoId" WHERE wp."waveUuid" = "Waves"."waveUuid")'
  ```
- This is more accurate for large wave collections (pagination-aware — client-side sort would only sort the current page)
- Consistent with how the frontend already passes sort params to `listWaves`

**Alternatives considered**:
1. Client-side sort using wave photos — would only sort the current page of results, leading to inconsistent ordering across pages. Rejected.

### Decision 3: Unified sort options structure

**Choice**: Keep the existing `sortOptions` array structure in both components, updating only the `sortBy` values:

| Option     | Friends `sortBy`    | Waves `sortBy`     |
|------------|---------------------|---------------------|
| A-Z        | `'alphabetical'`    | `'name'`            |
| Recent     | `'updatedAt'` → keep label, change sort logic | `'recentPhoto'` |

The Jotai atom values remain compatible:
- `friendsSortBy`: `'alphabetical'` (default), `'updatedAt'` (recent sort)
- `waveSortBy`: `'name'` (default), `'recentPhoto'` (recent sort)

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Friends without photos show incorrectly when sorting Recent | Sort friends with photos first, then friends without photos (date = 0) |
| Wave sort pagination inconsistency when toggling between name and recentPhoto | Sort change triggers full refresh (pagination reset to page 0) — existing behavior |
| Backend `recentPhoto` subquery performance on large wave collections | Existing subquery uses indexed columns (`WavePhotos.waveUuid`, `Photos.id`); negligible impact |

## Migration Plan

No database migrations, API changes, or user-facing migration needed. Changes are purely frontend logic updates:

1. Update `src/screens/FriendsList/index.js` — modify the `updatedAt` sort case to use photo date
2. Update `src/screens/WavesHub/index.js` — change `loadWaves` to pass `sortBy: 'recentPhoto'` for Recent sort; update `filteredWaves` client-side sort
3. No backend changes needed

## Open Questions

None identified.