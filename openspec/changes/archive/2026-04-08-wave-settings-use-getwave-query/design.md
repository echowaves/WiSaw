## Context

WaveSettings loads its initial state by calling the `updateWave` mutation with `name: waveName` — a hack to get the wave object back without actually changing anything. The backend now enforces a freeze guard: when a wave is frozen, any `updateWave` call that includes non-freeze fields (like `name`) is rejected. This makes WaveSettings inaccessible for frozen waves. The backend has deployed a new `getWave(waveUuid, uuid): Wave` query on the `wave-invite` branch that returns the full Wave type without side effects.

## Goals / Non-Goals

**Goals:**
- Use the new `getWave` query to load settings, eliminating the mutation-as-read hack
- Allow WaveSettings to load for frozen waves

**Non-Goals:**
- Changing how WaveSettings saves settings (the individual `updateWave` calls for open/splashDate/freezeDate are correct)
- Adding new UI to WaveSettings
- Fixing the backend freeze guard logic itself

## Decisions

### Decision 1: Add `getWave` to the waves reducer alongside existing operations

**Choice:** Add a new `getWave` export to `src/screens/Waves/reducer.js` using `gqlClient.query()`.

**Rationale:** All wave GraphQL operations are centralized in this reducer. Following the existing pattern keeps the codebase consistent. The query uses the same Wave return fields already used by `listWaves` and `updateWave`.

**Alternatives considered:**
- Inline the query in WaveSettings — rejected because it breaks the reducer pattern used everywhere else.

### Decision 2: Use `fetchPolicy: 'network-only'` for the getWave query

**Choice:** Set `fetchPolicy: 'network-only'` on the `getWave` query.

**Rationale:** WaveSettings needs fresh data every time it loads (settings may have been changed from another device or by date-driven freeze logic). Apollo's default `cache-first` could show stale `isFrozen` state.

## Risks / Trade-offs

- [Minimal risk] The `getWave` query is newly deployed — if the backend deployment rolls back, `getWave` would fail. → Mitigation: The backend is stable on `wave-invite`; this is a read-only query with no complex side effects.
- [Trade-off] `network-only` fetch policy means every settings open hits the network. → Acceptable for a settings screen that's opened infrequently.
