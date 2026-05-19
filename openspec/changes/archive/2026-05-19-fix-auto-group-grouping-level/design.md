## Context

The server-side `autoGroupPhotosIntoWaves` resolver already accepts `groupingLevel` as a required parameter (`GroupingLevel!`) and correctly uses it to:
1. Compare against the active wave's `groupingLevel` to detect level changes
2. Pass to `fitsPhotoInWave()` for geographic matching
3. Store on newly created waves

However, the client never sends this parameter — the mutation only sends `uuid`, so the server always falls back to `DEFAULT_GROUPING_LEVEL = 'CITY'`.

## Goals / Non-Goals

**Goals:**
- Pass the user's configured `groupingLevel` from `groupingAtom` to every `autoGroupPhotosIntoWaves` call
- Ensure all client entry points (manual button, auto-trigger, event bus) include `groupingLevel`

**Non-Goals:**
- Server-side changes (server already correct)
- Changes to the `groupingAtom` shape or storage layer
- Changes to wave creation, photo upload, or other mutations

## Decisions

### Decision 1: Read `groupingLevel` from `groupingAtom` at call time

**Choice:** Each caller reads `groupingLevel` from `groupingAtom` using `useAtomValue(groupingAtom)` at the time of the call, rather than caching it in component state.

**Rationale:**
- `groupingAtom` is already the source of truth (used by `GroupingSettings` screen)
- Reading at call time ensures the latest value is always used
- No need to sync state between components

**Alternatives considered:**
- Pass `groupingLevel` as a prop through the component tree — too verbose, unnecessary
- Cache in component state on mount — could become stale if user changes settings mid-session

### Decision 2: Update the GraphQL mutation to accept `groupingLevel`

**Choice:** Add optional `groupingLevel` variable to the client mutation, sent as `String` type.

**Rationale:**
- Server expects `GroupingLevel!` enum but GraphQL coerces String → Enum for known values
- Using `String` avoids needing to define the enum on the client
- Values are already validated on the server side

### Decision 3: Update `emitAutoGroup` to carry `groupingLevel`

**Choice:** Extend `emitAutoGroup(count, groupingLevel)` and `emitAutoGroupDone()` to carry the grouping level through the event bus.

**Rationale:**
- `UngroupedPhotosCard` emits the auto-group event but doesn't have access to `groupingAtom`
- Adding `groupingLevel` as a second parameter is backward-compatible (existing callers can omit it)
- The listener in `WavesHub` reads from `groupingAtom` directly instead, so the event bus parameter is optional

**Actually:** Better approach — the listener in `WavesHub` already has access to `groupingAtom` via `useAtomValue`, so no need to change the event bus. The `WavesHub` reads the atom directly when handling the auto-group.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| `groupingAtom` not hydrated when auto-group is first triggered | `hydrateGroupingAtom()` is called at app startup; if not ready, defaults to `'CITY'` which is the current behavior |
| Stale closure in `handleAutoGroup` callback | Use `useCallback` with `groupingLevel` in dependency array |
| Event bus callers (`emitAutoGroup`) don't pass groupingLevel | Listener reads from atom directly, not from event params |
