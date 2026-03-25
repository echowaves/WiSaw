## Why

Wave picker modals (MergeWaveModal, WaveSelectorModal) only fetch the first page of waves from the backend (20 results), making it impossible for users with more than 20 waves to find or select waves beyond that first page. WavesHub has infinite scroll but its search bar filters client-side only, so searching for a wave on an unloaded page returns no results. The backend `listWaves` query now supports a `searchTerm` parameter — this change wires it up on the frontend.

## What Changes

- Update the shared `listWaves` reducer function to accept and pass `searchTerm` to the GraphQL query
- Add infinite scroll (pagination) to MergeWaveModal and WaveSelectorModal so all waves are reachable
- Replace client-side search filtering with server-side search (debounced 300ms) in all three locations: WavesHub, WaveSelectorModal, MergeWaveModal
- When search term is empty, return all waves paginated as before

## Capabilities

### New Capabilities
- `wave-server-search`: Server-side wave search via the `searchTerm` parameter on the `listWaves` GraphQL query, with debounced input and automatic page reset on search term change

### Modified Capabilities
- `wave-selector-modal`: Add infinite scroll pagination and server-side search (currently loads page 0 only with client-side filter)
- `wave-merge`: Add infinite scroll pagination and server-side search to the merge target picker (currently loads page 0 only with client-side filter)
- `wave-hub`: Replace client-side search filtering with server-side search via the `listWaves` `searchTerm` parameter

## Impact

- **API layer**: `src/screens/Waves/reducer.js` — `listWaves` function signature and GQL query gain `searchTerm` param
- **Components**: `src/components/WaveSelectorModal/index.js`, `src/components/MergeWaveModal/index.js` — gain pagination state and `onEndReached` handling
- **Screens**: `src/screens/WavesHub/index.js` — search triggers server query instead of local filter
- **Backend**: No changes needed — `searchTerm` parameter already deployed
