## Context

The WiSaw app uses Expo Router with a Drawer navigator as its primary navigation structure. Most screens are registered as flat Drawer siblings. The `(tabs)` group is the exception — it wraps its screens in a nested Stack navigator, which gives detail screens like `shared/[photoId]` proper back-stack behavior.

The waves feature has three route files (`waves.tsx`, `wave-detail.tsx`, `photo-selection.tsx`) registered as flat Drawer siblings, plus a dead duplicate `waves-hub.tsx`. Because Drawer navigators switch between screens rather than pushing onto a stack, `router.back()` from `wave-detail` does not return to the waves list — it falls back to the initial drawer route (home). Additionally, Drawer screens are kept mounted and reused, so navigating to a different wave reuses the same `wave-detail` component instance without remounting, showing stale data.

## Goals / Non-Goals

**Goals:**
- Back navigation from Wave Detail returns to the Waves list
- Back navigation from Photo Selection returns to Wave Detail
- Each wave navigation creates a fresh screen instance (no stale data)
- Align waves navigation architecture with the existing working `(tabs)` pattern

**Non-Goals:**
- Changing the visual design or UX of any wave screen
- Modifying GraphQL queries, Jotai atoms, or event buses
- Adding new features to waves (only fixing navigation and caching)
- Changing the Drawer layout for non-wave screens

## Decisions

### Decision 1: Nest wave routes in a Stack group directory

Create `app/(drawer)/waves/` as a directory with its own `_layout.tsx` containing a Stack navigator. Move wave screens inside it.

**Rationale**: This mirrors the proven `(tabs)` pattern already in the codebase. Stack navigators maintain a proper back-stack, so `router.back()` naturally returns to the previous screen in the group. Expo Router automatically creates a Stack group when a directory has a `_layout.tsx`.

**Alternatives considered**:
- *Fix individual navigation calls* (e.g., `router.replace` instead of `router.back`): Would paper over the structural issue and wouldn't fix the caching bug.
- *Use `useFocusEffect` to reload data*: Fixes caching but not back navigation, and adds unnecessary re-fetches.

### Decision 2: Use a dynamic route segment `[waveUuid]` for Wave Detail

Replace the static `wave-detail.tsx` route with `waves/[waveUuid].tsx`. The wave's UUID becomes part of the URL path (`/waves/abc-123`) rather than a search parameter.

**Rationale**: Expo Router creates a new screen instance for each unique dynamic segment value. This guarantees a fresh mount (and fresh data load) per wave without any additional state management. The `waveUuid` is extracted via `useLocalSearchParams()` from the route segment instead of from query params.

**Alternatives considered**:
- *Add `waveUuid` to the `useEffect` dependency array*: Fixes data reload but still reuses the same component instance, requiring manual state reset for all local state (photos, pagination, expand state, etc.).
- *Use a `key` prop on the WaveDetail component*: Works but is fragile and non-standard for routing.

### Decision 3: Keep `waveName` as a search parameter

The wave name is still passed as `params: { waveName }` since it's display-only metadata, not a route identity. Only `waveUuid` (the identity) goes in the route path.

### Decision 4: Delete `waves-hub.tsx`

This file is a hidden duplicate of `waves.tsx` with `drawerItemStyle: { display: 'none' }`. No code references it for navigation. It is dead code.

## Route Structure (Before → After)

```
BEFORE:                          AFTER:
app/(drawer)/                    app/(drawer)/
  waves.tsx          ────────►     waves/
  wave-detail.tsx    ────────►       _layout.tsx  (Stack)
  photo-selection.tsx────────►       index.tsx    (WavesHub list)
  waves-hub.tsx      ────────►       [waveUuid].tsx (WaveDetail)
                                     photo-selection.tsx
```

## Navigation Flow (After)

```
Drawer "Waves"
    │
    ▼
/waves/               (Stack: index.tsx → WavesHub)
    │  router.push(`/waves/${waveUuid}`)
    ▼
/waves/abc-123        (Stack: [waveUuid].tsx → WaveDetail)
    │  router.push('/waves/photo-selection')
    ▼
/waves/photo-selection  (Stack: photo-selection.tsx)

Back: photo-selection → [waveUuid] → waves list  ✅
```

## Risks / Trade-offs

- **[Risk] Expo Router version compatibility with nested drawer + stack**: The `(tabs)` group already demonstrates this pattern works with the current Expo Router 6.0.15. → No mitigation needed.
- **[Risk] Deep links to wave detail change from `/wave-detail?waveUuid=X` to `/waves/X`**: → No existing deep links target wave detail (deep linking only handles `/photo/`, `/friend/`, `/friendshipName/` types). No migration needed.
- **[Risk] Any code navigating to the old `/wave-detail` path will break**: → Only `WavesHub/index.js` and `WaveDetail/index.js` (for photo-selection) navigate to these routes. Both will be updated.
- **[Trade-off] Directory nesting adds a `_layout.tsx` file**: Minimal cost for correct navigation behavior.
