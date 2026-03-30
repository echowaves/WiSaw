## Context

The WaveHeaderIcon is a self-contained component in `PhotosListHeader` that currently renders a static grey water icon and navigates to `/waves`. It has no awareness of wave state. The `IdentityHeaderIcon` beside it already demonstrates the pattern we want: state-aware coloring (grey→coral) and a red dot badge, all driven by reading Jotai atoms.

Wave counts (`wavesCount`, `ungroupedPhotosCount`) currently exist only as local state — `ungroupedPhotosCount` in `app/(drawer)/waves/index.tsx` and `waves.length` inside `WavesHub`. Neither is accessible to the WaveHeaderIcon on the home screen. The backend now provides both `getWavesCount(uuid)` and `getUngroupedPhotosCount(uuid)` as lightweight integer queries.

The Waves empty state currently uses a simple `EmptyStateCard` with "No Waves Yet / Create your first wave to start organizing photos." This gives no educational context about what waves are or how to use them.

## Goals / Non-Goals

**Goals:**
- WaveHeaderIcon visually communicates wave state: grey (no waves), coral (has waves), red dot (has ungrouped photos)
- Two global Jotai atoms provide wave counts to any component, fetched once eagerly, then maintained locally
- Waves empty state educates new users with a multi-card explainer that adapts to their situation (has ungrouped photos vs. no photos)

**Non-Goals:**
- Real-time sync of counts with backend (local bookkeeping is sufficient, counts self-correct on next waves screen visit via `useFocusEffect`)
- Changing the waves list behavior, sorting, search, or any existing wave management UX
- Adding a persistence layer for the atoms (they're transient, re-fetched on app start)

## Decisions

### 1. Two Jotai atoms with `null` default

**Decision**: Add `wavesCount = atom(null)` and `ungroupedPhotosCount = atom(null)` to `src/state.js`. Default `null` means "not yet loaded" — distinguishable from "loaded and zero."

**Rationale**: The WaveHeaderIcon can show a neutral state (grey, no badge) while `null`, then transition to the correct visual once fetched. Using `0` as default would incorrectly show "no waves" before the fetch completes.

**Alternative considered**: Using a single derived atom — rejected because `wavesCount` and `ungroupedPhotosCount` are independently useful and updated at different times.

### 2. Eager fetch from WaveHeaderIcon on mount

**Decision**: The WaveHeaderIcon itself fetches both counts on mount when atoms are `null`, using the existing `uuid` atom. It calls `getWavesCount({ uuid })` and `getUngroupedPhotosCount({ uuid })` in parallel, sets the atoms, and renders accordingly.

**Rationale**: The WaveHeaderIcon is the primary consumer of this data on the home screen. Placing the fetch here keeps it self-contained (matching the IdentityHeaderIcon pattern which reads `nickName` atom). No need to add fetch logic to PhotosList or the root layout.

**Alternative considered**: Fetching in root `_layout.tsx` — rejected because that adds startup latency for data only needed by one icon.

### 3. Local atom updates at mutation call sites (no refetch)

**Decision**: After the initial fetch, atoms are updated directly at each mutation site:

| Mutation site | Atom update |
|---|---|
| Upload complete (no wave) | `ungroupedPhotosCount += 1` |
| Upload complete (to wave) | no change |
| Auto-group done | `ungroupedPhotosCount = 0`, `wavesCount += totalWavesCreated` |
| Wave created manually | `wavesCount += 1` |
| Wave deleted | `wavesCount -= 1`, `ungroupedPhotosCount += wave.photosCount` |
| Photo added to wave | `ungroupedPhotosCount -= 1` (floor 0) |

**Rationale**: Avoids backend round-trips after every action. The counts self-correct on next waves screen visit (`useFocusEffect` in `waves/index.tsx` already re-fetches `getUngroupedPhotosCount`; we extend it to also re-fetch `getWavesCount`).

**Alternative considered**: Event bus for count changes — rejected because the atoms themselves serve as the notification mechanism. Components reading the atoms re-render automatically when values change.

### 4. Unify ungroupedPhotosCount — atom replaces local state in waves/index.tsx

**Decision**: `app/(drawer)/waves/index.tsx` currently maintains its own `useState(0)` for `ungroupedCount`. This will be replaced with reading/writing the global `ungroupedPhotosCount` atom, eliminating the duplicate state.

**Rationale**: Having both a local state and a global atom for the same value creates sync issues. The atom becomes the single source of truth, read by both the WaveHeaderIcon and the waves screen kebab badge.

### 5. WavesExplainerView as a dedicated component with two variants

**Decision**: Create `src/components/WavesExplainerView/index.js` following the `PrivacyExplainerView` visual pattern — ScrollView with icon header, themed info cards, and CTA button. It accepts `ungroupedCount` and `onAutoGroup` / `onNavigateHome` callbacks, and internally switches between two content variants:

- **Has ungrouped photos**: cards explain waves, highlight the ready-to-organize photos, CTA = "Auto Group N Photos"
- **No photos**: cards explain waves and how to take photos, CTA = "Take a Photo" → navigates back to home

**Rationale**: A dedicated component keeps WavesHub clean. Two variants in one component is simpler than two separate components since only the card content and CTA differ.

### 6. WaveHeaderIcon red dot mirrors IdentityHeaderIcon badge

**Decision**: Use the exact same badge styling as `IdentityHeaderIcon` — 10×10 red circle at `position: absolute, top: 4, right: 4` with `borderColor: theme.HEADER_BACKGROUND` border.

**Rationale**: Visual consistency. Both icons sit in the same header row, share the same 40×40 container, and use badges to signal "action needed."

## Risks / Trade-offs

- [Risk: Counts drift from backend truth over time] → Mitigated by re-fetching both counts on waves screen focus (`useFocusEffect`). In practice, counts only drift during a single session between waves visits. Drift magnitude is bounded by user actions in that session.
- [Risk: WaveHeaderIcon flashes grey then coral on cold start] → The fetch is fast (single integer queries). The `null` → value transition happens before the first meaningful paint in most cases. Even if visible, it's a subtle icon color change, not a layout shift.
- [Trade-off: WaveHeaderIcon gains network fetch responsibility] → This makes it slightly heavier than a pure reader, but only on first mount when atoms are `null`. Subsequent renders are pure atom reads.
- [Risk: wave.photosCount may be stale when deleting] → WavesHub gets `photosCount` from the `listWaves` response. If a user deleted photos from a wave since last refresh, the count may be off. Self-corrects on next focus refresh.
