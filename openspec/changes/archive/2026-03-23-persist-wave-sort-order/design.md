## Context

The Waves screen displays a paginated list of user-created waves (photo collections). Users can sort by `updatedAt` or `createdAt` in ascending or descending order. Currently, sort state is held in React `useState` inside `app/(drawer)/waves/index.tsx` with hardcoded defaults. No persistence exists — sort resets on every app restart or full screen remount.

The codebase already persists other preferences via jotai atoms + SecureStore with manual hydration at startup in `app/_layout.tsx`. This includes `isDarkMode`, `followSystemTheme`, UUID, and nickname. The `waveStorage.js` utility already handles wave-related SecureStore operations with timeout protection.

`WavesHub` has two overlapping effects that trigger data fetches: a `useEffect` on `[sortBy, sortDirection]` and a `useFocusEffect` on `[uuid]`. The `useFocusEffect` has an incomplete dependency array (missing `loadWaves`), creating a stale closure risk where returning to the screen could fetch with outdated sort values.

## Goals / Non-Goals

**Goals:**
- Persist wave sort preferences across app restarts using the established jotai + SecureStore + hydration pattern
- Eliminate prop-drilling of sort state from `WavesScreen` → `WavesHub` by using shared atoms
- Fix stale closure in `WavesHub` `useFocusEffect` by correcting dependency array
- Consolidate duplicate data-fetching effects into a single `useFocusEffect`

**Non-Goals:**
- Changing available sort options or adding new ones
- Per-user or per-device sync of sort preferences (stays local-only)
- Refactoring other screen preferences to match this pattern
- Changing the GraphQL API sort parameters

## Decisions

### D1: Jotai atoms + SecureStore with startup hydration

**Choice**: Follow the existing pattern — plain atoms in `src/state.js`, SecureStore persistence in `src/utils/waveStorage.js`, hydration in `app/_layout.tsx` via `Promise.allSettled`.

**Alternatives considered**:
- `atomWithStorage` from jotai/utils — not used anywhere in the codebase; would introduce an inconsistent pattern
- Lazy hydration at Waves screen mount — works but breaks the established convention of hydrating all preferences at startup

**Rationale**: Consistency with existing `isDarkMode`/`followSystemTheme` pattern. All user preferences load the same way.

### D2: Store as single JSON blob

**Choice**: Store `{ sortBy, sortDirection }` as a single JSON string under one SecureStore key (`WAVE_SORT_PREFERENCES`), not two separate keys.

**Rationale**: These two values are always read and written together. Single key means one SecureStore read/write instead of two, and atomic updates (no risk of reading mismatched sortBy/sortDirection).

### D3: Consolidate WavesHub effects into single useFocusEffect

**Choice**: Remove the separate `useEffect` on `[sortBy, sortDirection]` and let `useFocusEffect` with `[loadWaves]` as dependency handle all data loading. `loadWaves` already depends on `[uuid, sortBy, sortDirection]`, so its identity changes when any of those change — triggering the `useFocusEffect` callback to be recreated and re-run.

**Alternatives considered**:
- Keep both effects but fix the `useFocusEffect` deps — would cause double-fetch when sort changes while the screen is focused, since `useFocusEffect` re-runs on dep change while focused
- Use a ref to track sort changes — unnecessary complexity

**Rationale**: Single effect, correct deps, no double-fetch. Simpler to reason about.

### D4: WavesHub reads atoms directly instead of receiving props

**Choice**: `WavesHub` uses `useAtom` to read `waveSortBy` and `waveSortDirection` directly, removing the need for prop-drilling from `WavesScreen`.

**Rationale**: Atoms are the source of truth. Passing them as props creates an unnecessary indirection and was only needed because sort state was local to `WavesScreen`.

## Risks / Trade-offs

- **[Brief default-sort flash on cold start]** → If stored sort differs from atom default, the Waves screen may briefly render before hydration resolves. Mitigated: this is the same behavior as dark mode and is sub-100ms in practice. The Waves screen is never the first screen rendered.
- **[SecureStore timeout]** → SecureStore read could hang. Mitigated: 3-second timeout (existing pattern in `waveStorage.js`), falls back to defaults.
- **[useFocusEffect re-render churn]** → Changing `loadWaves` identity on every sort change causes `useFocusEffect` to re-run. Mitigated: this is the desired behavior — we want to re-fetch when sort changes. The `loading` guard inside `loadWaves` prevents concurrent fetches.
