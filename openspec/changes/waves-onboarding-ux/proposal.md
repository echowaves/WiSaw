## Why

The WaveHeaderIcon in the photo feed header gives no visual signal about waves state — it's always grey regardless of whether waves exist or ungrouped photos need attention. New users landing on the Waves screen for the first time see a bare "No Waves Yet" empty state with no explanation of what waves are or how to use them. This creates a dead-end discovery experience with no onboarding guidance.

## What Changes

- WaveHeaderIcon gains state-aware coloring: grey when no waves, coral (MAIN_COLOR) when waves exist, plus a red dot badge when ungrouped photos are present
- Two new Jotai atoms (`wavesCount`, `ungroupedPhotosCount`) provide global wave state, eagerly fetched on first load using `getWavesCount` and `getUngroupedPhotosCount` backend queries, then kept in sync locally via direct atom updates at mutation call sites (no further backend calls)
- WavesHub empty state replaces the minimal card with a multi-card explainer view (following the privacy explainer pattern) with two variants: one for users with ungrouped photos (drives auto-group), one for users with no photos (encourages taking photos first)
- Atom updates added at all mutation sites: photo upload, auto-group, wave create, wave delete, photo added to wave

## Capabilities

### New Capabilities
- `waves-global-state`: Two Jotai atoms (`wavesCount`, `ungroupedPhotosCount`) eagerly fetched once and locally maintained — providing wave state for any component without backend round-trips
- `waves-explainer`: Multi-card educational view shown when waves list is empty, with two content variants based on ungrouped photo count, explaining what waves are and how to use them

### Modified Capabilities
- `wave-header-icon`: Icon color becomes state-aware (grey/coral) and gains a red dot badge for ungrouped photos
- `wave-hub`: Empty state switches from a simple EmptyStateCard to the new WavesExplainerView component

## Impact

- New file: `src/components/WavesExplainerView/index.js` — multi-card educational explainer
- New atoms in `src/state.js`: `wavesCount`, `ungroupedPhotosCount`
- New query in `src/screens/Waves/reducer.js`: `getWavesCount`
- Modified: `src/components/WaveHeaderIcon/index.js` — reads new atoms, conditional icon color and badge
- Modified: `src/screens/WavesHub/index.js` — renders WavesExplainerView in empty state, updates atoms on wave create/delete/auto-group
- Modified: `src/screens/PhotosList/index.js` or WaveHeaderIcon — eagerly fetches both counts on mount
- Modified: `src/hooks/usePhotoActions.js` — decrements ungroupedPhotosCount when photo added to wave
- Modified: `src/screens/PhotosList/upload/usePhotoUploader.js` or uploadBus subscriber — increments ungroupedPhotosCount on upload without wave
- Modified: `app/(drawer)/waves/index.tsx` — reads ungroupedPhotosCount from atom instead of local state
- Backend dependency: `getWavesCount(uuid: String!): Int!` query (already deployed)
