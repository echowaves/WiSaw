## Context

The app uses Jotai atoms for reactive state and AsyncStorage for persistence. The `groupingAtom` holds `{ enabled, groupingLevel, lastTriggerLat, lastTriggerLon, lastTriggerTs }`. At startup, `hydrateGroupingAtom()` reads AsyncStorage and updates a module-level `_groupingState` variable but never sets the Jotai atom itself — the atom keeps its hardcoded default `{ enabled: true, ... }`. A separate `registerGroupingSetter` mechanism exists but only activates when the GroupingSettings screen mounts, which most users rarely visit.

The waves list uses `useFocusEffect` with a `useCallback`-wrapped callback. Since the callback's deps (`loadWaves`, `debouncedSearch`, `fetchCounts`) rarely change identity, the callback reference stays stable and `useFocusEffect` skips re-execution on subsequent screen visits.

The capture flow in `useCameraCapture` checks `grouping.enabled` and, when false, passes through the caller's `waveUuid`. This means wave-detail captures still tag to the viewed wave even when the user has disabled grouping.

## Goals / Non-Goals

**Goals:**
- Ensure the persisted `grouping.enabled` value is reflected in `groupingAtom` immediately at app startup
- When grouping is disabled, photos are always uploaded as ungrouped regardless of screen context
- Waves list refreshes from the server on every screen visit

**Non-Goals:**
- Changing the grouping settings UI or storage format
- Modifying the auto-group mutation or drift-check logic
- Changing how `groupingLevel` or trigger coordinates are persisted (those work correctly)

## Decisions

### 1. Set groupingAtom in _layout.tsx after hydration

**Decision**: In `_layout.tsx`, add `useSetAtom(groupingAtom)` and call it with the hydrated settings object inside the `initialize()` function, after `hydrateGroupingAtom()` resolves.

**Why**: This follows the same pattern already used for `activeWaveAtom` (hydrate → set atom). The module-level `_groupingState` continues to serve non-React code, while the atom now also receives the correct value for React components.

**Alternative considered**: Refactor `groupingAtom` to be a self-hydrating async atom. Rejected as over-engineering — the startup hydration pattern is already established and works for all other atoms.

### 2. Drop waveUuid when grouping is disabled

**Decision**: In `useCameraCapture`, when `grouping.enabled` is `false`, call `enqueueCapture` without `waveUuid` (omit it entirely), regardless of what the caller passes.

**Why**: The user's intent when disabling grouping is "don't organize my photos into waves." Passing through `waveUuid` from wave-detail contradicts that intent. Uploading as ungrouped is consistent — the user can still manually assign photos to waves later.

### 3. Remove useCallback inside useFocusEffect

**Decision**: Remove the `useCallback` wrapper from the callback passed to `useFocusEffect` in WavesHub. Pass a plain function that always executes on focus.

**Why**: `useFocusEffect` from Expo Router already handles cleanup/setup semantics. The `useCallback` wrapper causes the callback to keep a stable identity when deps don't change, which makes `useFocusEffect` think nothing changed. A plain function creates a new reference on every render, ensuring the effect fires on every focus event.

**Risk**: Slightly more re-renders triggering the effect. Mitigated by the existing `loadingRef` guard that prevents concurrent duplicate fetches.

## Risks / Trade-offs

- **[Startup timing]** → Setting the atom during async initialization means there's a brief window where components see the default `{ enabled: true }`. This is acceptable because no grouping-related logic runs before initialization completes (camera capture requires user interaction).
- **[Wave-detail UX with grouping OFF]** → Photos taken from wave-detail won't be added to the viewed wave when grouping is disabled. This is intentional — the user chose to disable grouping. They can manually assign photos afterward.
