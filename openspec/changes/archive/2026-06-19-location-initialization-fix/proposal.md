## Why

The app sometimes gets stuck on "initializing the location" when starting on a fresh device boot. This happens because `Location.getLastKnownPositionAsync()` has no timeout protection and can block for 30-60+ seconds on iOS when the system location service hasn't initialized yet. Users are forced to restart the app to proceed. This is especially problematic on iOS where location services may not be ready immediately after boot.

## What Changes

- Add timeout protection to `Location.getLastKnownPositionAsync()` call (5 second timeout)
- Add timeout protection to `Location.watchPositionAsync()` setup (10 second timeout)
- Add watchdog mechanism to detect when the location watcher stops receiving updates (30 second no-update detection)
- Introduce new `locationAtom` statuses: `timeout` and `unavailable` for better status tracking
- Add initialization progress tracking (`initStage`) to monitor startup progress

## Capabilities

### New Capabilities
- `location-initialization-timing`: New spec defining timeout behaviors, watchdog mechanisms, and acceptable initialization durations for location provider
- `location-status-transitions`: New spec defining all valid status transitions for `locationAtom` including new `timeout` and `unavailable` states

### Modified Capabilities
- `location-provider`: Current spec only defines basic functionality but lacks timeout requirements. This change adds explicit timeout constraints and failure handling requirements.

## Impact

**Affected files:**
- `src/hooks/useLocationProvider.js` - Main implementation file with 3-phase initialization
- `src/state.js` - Add `timeout` and `unavailable` status values to `locationAtom`
- `app/_layout.tsx` - May need to handle new status states in UI
- Various screens that use location (PhotosList, WaveDetail, etc.) - Already handle pending/denied states, may need updates for new statuses

**Breaking changes:** None - all changes are additive and backward compatible with existing status values (`pending`, `ready`, `denied`)

**Dependencies:** No new dependencies needed, uses existing `expo-location` API
