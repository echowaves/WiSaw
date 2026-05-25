## REMOVED Requirements

### Requirement: Pre-upload drift check
**Reason**: Drift detection relied on the active wave concept (`activeWaveAtom`) to determine whether a photo's location fits within the current wave's geo-boundary. The backend has removed the `isActive` field and no longer tracks a single active wave. The backend's `autoGroupPhotosIntoWaves` now handles wave matching internally by searching for existing waves with matching locality, season, and grouping level.
**Migration**: Remove the `checkAndAssignWave` function and all `isLocationInWave` calls from the upload path. Photos upload as ungrouped and are assigned to waves by the backend during auto-grouping.

### Requirement: isLocationInWave GraphQL query
**Reason**: The `isLocationInWave` query was used exclusively by the client-side drift check, which is being removed. The backend no longer relies on client-side drift detection.
**Migration**: The `isLocationInWave` function in `src/screens/Waves/reducer.js` can be removed if no other code paths reference it.
