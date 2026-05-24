## Context

The auto-group feature calls `autoGroupPhotosIntoWaves` in a loop until all ungrouped photos are processed. The backend processes up to 200 photos per batch and can create multiple waves within that single call, but only returns the UUID of the last wave created. The frontend tracks waves using a Set of returned `waveUuid`s — so each API call contributes at most one unique UUID regardless of how many waves were actually created internally.

## Goals / Non-Goals

**Goals:**
- Fix the progress overlay to show accurate wave counts by reading `wavesCreated` from the API response
- Maintain backward compatibility with existing code paths (upload-time auto-group, drift-triggered auto-group)

**Non-Goals:**
- Changing how waves are created or grouped on the backend
- Modifying the loop termination logic (still uses `hasMore`)
- Adding new UI elements or changing the progress overlay layout

## Decisions

### Use accumulated counter instead of Set.size

**Decision**: Replace `waveUuidSet` with a simple integer counter that accumulates `wavesCreated` from each batch response.

**Rationale**: The backend now reports exactly how many waves it created per batch. This is simpler than tracking UUIDs (no Set, no deduplication logic) and always accurate — even if the same waveUuid somehow appeared in multiple batches (which shouldn't happen), the counter would still be correct.

### Extend mutation selection set only

**Decision**: Add `wavesCreated` to the GraphQL query in `src/screens/Waves/reducer.js` without changing any other fields or adding new mutations.

**Rationale**: Minimal surface area for change. The backend already returns this field; we just need to request it on the client side and use it.

## Risks / Trade-offs

- **Stale API contract**: If the backend hasn't deployed the `wavesCreated` field yet, the response will be null/undefined. Mitigation: Use a fallback of 0 (`result.wavesCreated ?? 0`) in the accumulator.
- **No rollback needed**: This is purely a client-side fix; no database migration or API versioning required.
