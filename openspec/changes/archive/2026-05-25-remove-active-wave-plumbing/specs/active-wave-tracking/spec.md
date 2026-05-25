## REMOVED Requirements

### Requirement: Active wave state management
**Reason**: The backend no longer has an `isActive` field on the Wave type. The "single active wave" model has been replaced with dynamic wave matching in `autoGroupPhotosIntoWaves`. There is no server-side concept of an active wave to track.
**Migration**: No action needed. The backend's `findOrCreateWave` logic in `autoGroupPhotosIntoWaves` now dynamically finds matching waves by locality, season, and grouping level. Remove `activeWaveAtom` from `state.js`.

### Requirement: Active wave updated on auto-group
**Reason**: With no active wave concept, there is nothing to update after auto-grouping completes. The backend handles wave selection internally.
**Migration**: Remove the `setActiveWave`/`saveActiveWave` calls after auto-group in WavesHub's `handleAutoGroup`.

### Requirement: Active wave persistence
**Reason**: No active wave to persist. The `@activeWave` SecureStore key and `activeWaveStorage.js` utility are unused.
**Migration**: Delete `src/utils/activeWaveStorage.js`. Remove `hydrateActiveWaveAtom` call from `_layout.tsx` startup. Stale `@activeWave` keys in users' SecureStore will simply never be read again.
