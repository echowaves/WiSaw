## Why

The waves list currently has no way to control sort order — it always returns waves in the backend's default order. Users need to sort their waves by creation date or last update, ascending or descending, to quickly find relevant waves. The backend `listWaves` API already supports `sortBy` and `sortDirection` parameters but the frontend doesn't use them.

## What Changes

- Add sort state (`sortBy`, `sortDirection`) to WavesHub, defaulting to `updatedAt` / `desc`
- Pass sort parameters through to the `listWaves` GraphQL query
- Add sort menu items to the existing kebab header menu (Option A: inline items alongside Cancel, Create New Wave, Auto Group)
- Sort state is session-only (React state / Jotai atom) — no persistence across app restarts
- Changing sort triggers a full list refresh from page 0

## Capabilities

### New Capabilities
- `waves-list-sort`: Sort options for the waves list including UI controls in the kebab menu and state management for sort parameters

### Modified Capabilities
- `wave-hub`: Add requirement for sort parameters being passed during waves list fetching and refresh
- `waves-auto-group-header`: Add sort menu items to the kebab header menu alongside existing options

## Impact

- `src/screens/Waves/reducer.js` — Add `sortBy` and `sortDirection` variables to `listWaves` GraphQL query
- `src/screens/WavesHub/index.js` — Add sort state, pass to `loadWaves`, refresh on sort change
- `app/(drawer)/waves/index.tsx` — Add sort menu items to kebab ActionSheet
