## Context

The `[waveUuid].tsx` route screen reads `isFrozen` and `myRole` from `useLocalSearchParams()` — values set once at navigation time by WavesHub or join flow. These static params drive the header (snowflake icon, role badge) and are passed as props to WaveDetail (frozen banner, edit restrictions). When WaveSettings changes the wave's frozen state, returning via `router.back()` leaves these params stale.

The codebase already uses `useFocusEffect` from `expo-router` for refresh-on-return patterns (e.g., `waves/index.tsx` refetches counts on focus). The `getWave` query exists in the waves reducer and is already used by WaveSettings for loading.

## Goals / Non-Goals

**Goals:**
- WaveDetail screen reflects current `isFrozen` and `myRole` after returning from WaveSettings or any other screen
- No loading flash on initial render (use route params as initial values)

**Non-Goals:**
- Real-time updates while on the WaveDetail screen (subscriptions)
- Refreshing the photo list on focus (separate concern)
- Changing how WavesHub passes params (the refetch-on-focus makes this irrelevant)

## Decisions

### Decision 1: Use `useFocusEffect` + `getWave()` in the route screen

**Choice:** Add `useFocusEffect` to `[waveUuid].tsx` that calls `getWave({ waveUuid, uuid })` and updates local `useState` for `frozen` and `role`.

**Rationale:** Follows the existing pattern used in `waves/index.tsx`. The route screen already owns the header rendering, so it's the natural place to own the state that drives the header. `getWave` is a lightweight single-row query, acceptable to call on every focus for a screen visited infrequently.

**Alternatives considered:**
- Jotai atoms for wave metadata — overkill for state shared between only two screens via navigation
- `router.setParams()` from WaveSettings — fragile, operates on current route not parent, and couples WaveSettings to the parent's param structure

### Decision 2: Initialize state from route params

**Choice:** `useState` initialized from `useLocalSearchParams()` values, then overwritten by `getWave()` on focus.

**Rationale:** Route params provide immediate values for the first render (no loading state needed). The `useFocusEffect` fires on initial mount too, so the state will be validated against the backend immediately.

## Risks / Trade-offs

- [Trade-off] Extra network call on every focus return → Acceptable for a settings-type flow; `getWave` is a single-row SELECT by primary key
- [Minimal risk] If `getWave` fails on refocus, stale state persists → Acceptable; user already sees content, and the error is logged silently
