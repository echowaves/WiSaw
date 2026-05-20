## Context

The grouping settings (`enabled`, `groupingLevel`, `lastTriggerLat`, `lastTriggerLon`, `lastTriggerTs`) are persisted to AsyncStorage via `groupingStorage.js` but the Jotai atom (`groupingAtom`) is never hydrated at app startup. Additionally, `setGroupingLevel()` mutates the internal `_groupingState` ref without updating the Jotai atom, breaking reactivity.

Current flow:
1. App starts → `groupingAtom` initialized with defaults (`CITY`, `enabled: true`)
2. User changes grouping level in Settings → `setGroupingLevel()` saves to AsyncStorage but does NOT update Jotai atom
3. App restarts → `hydrateGroupingAtom()` is never called → defaults used again

## Goals / Non-Goals

**Goals:**
- Hydrate `groupingAtom` from AsyncStorage during app startup in `_layout.tsx`
- Fix `setGroupingLevel()` to update the Jotai atom after saving to AsyncStorage
- Ensure all Jotai subscribers (auto-group, settings UI) see the persisted value immediately

**Non-Goals:**
- Adding new settings or changing the grouping level options
- Migrating grouping storage from AsyncStorage to SecureStore
- Fixing `setGroupingEnabled()` or `setLastTriggerLocation()` (out of scope)

## Decisions

### Decision 1: Hydrate in `_layout.tsx` alongside other parallel loads
**Rationale:** The app already loads theme, sort preferences, and user identity in a `Promise.allSettled` block in `_layout.tsx`. Adding `hydrateGroupingAtom()` there keeps initialization centralized and ensures the atom is ready before any screen mounts. This matches the existing pattern used for other persisted settings.

**Alternatives considered:**
- Hydrate in each screen that needs it — rejected: too late, causes flash of wrong defaults
- Hydrate in a custom hook — rejected: hooks can't run at module initialization time
- Use Jotai's `atomWithStorage` — rejected: would require refactoring all consumers, out of scope

### Decision 2: Fix `setGroupingLevel()` to call `set(groupingAtom, next)`
**Rationale:** The `updateGroupingAtom` already does this correctly (line 28: `set(groupingAtom, next)`). `setGroupingLevel()` is a convenience wrapper that should behave the same way. By mirroring the pattern, we ensure consistency and fix the reactivity bug without requiring consumers to use `updateGroupingAtom` directly.

**Alternatives considered:**
- Replace `setGroupingLevel()` with `updateGroupingAtom` calls — rejected: would require changes in `GroupingSettings/index.js`
- Create a new hook — rejected: adds unnecessary abstraction layer

### Decision 3: Export `hydrateGroupingAtom` from `src/state.js`
**Rationale:** `_layout.tsx` already imports from `src/state.js` for other utilities. This avoids adding a new import path and keeps the pattern consistent with how `STATE.hydrateGroupingAtom?.()` is already used in `GroupingSettings/index.js` (optional chaining, line 41).

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Hydration is async — atom briefly shows defaults before hydration completes | Acceptable: defaults are benign (CITY, enabled). The `?.` optional chaining in existing code already handles this. Settings UI already re-hydrates on mount as fallback. |
| `setGroupingLevel()` now has two async operations (Storage + Jotai) | No functional impact: both are fire-and-forget. Jotai update is synchronous once the await resolves. |
| No change to `setGroupingEnabled()` — same bug exists there | Out of scope: tracked separately if needed. Only `groupingLevel` is user-reported. |

## Migration Plan

No migration needed. The fix is purely additive (hydration call) and corrective (atom update). Existing AsyncStorage data is already in the correct format — `hydrateGroupingAtom()` already handles the old key migration (`@grouping:granularity` → `@grouping:groupingLevel`).
