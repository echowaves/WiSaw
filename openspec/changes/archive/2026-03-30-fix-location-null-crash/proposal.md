## Why

The app crashes on startup with `TypeError: Cannot read property 'coords' of null` in `requestGeoPhotos`. After the recent header simplification refactor, `reload()` can be called before `locationState` is ready — specifically by the `netAvailable` effect, the identity-change subscription, and `useFeedSearch` deep-link/bus handlers — passing `location: null` into `requestGeoPhotos` which unconditionally destructures `location.coords`.

## What Changes

- Add a location-readiness guard in the PhotosList `reload()` function so that geo-feed requests are skipped when location is not yet available.
- This is a single-point fix that protects all callers (effects, event handlers, search callbacks) rather than patching each individually.

## Capabilities

### New Capabilities
- `reload-location-guard`: Guard geo-feed reload against null location to prevent crash when reload is triggered before location permission resolves.

### Modified Capabilities

## Impact

- `src/screens/PhotosList/index.js` — `reload()` callback gains an early return when `location` is null.
- No API, dependency, or breaking changes.
