## Why

The location provider currently uses `Accuracy.Balanced` and `distanceInterval: 100` which means the device never engages GPS and only updates when the user moves 100+ meters. On a phone, the initial fast-seed from `getLastKnownPositionAsync` can be a stale cell-tower fix hundreds of meters off, and the watcher never refines it because Balanced accuracy doesn't spin up GPS and the distance threshold suppresses small corrections. Photos get tagged with inaccurate coordinates and the geo feed shows photos from a different area than the user is actually in.

## What Changes

- **3-phase location refinement** in `useLocationProvider`: Phase 1 (fast seed with last known), Phase 2 (high-accuracy GPS refinement for up to 30 seconds with accuracy-gated updates), Phase 3 (battery-friendly maintenance watcher identical to today).
- **Accuracy tracking** in `locationAtom`: add an `accuracy` field (horizontal accuracy in meters) so the provider can compare fixes and only accept improvements.
- **Remove auto-reload on coordinate change**: the feed will no longer re-fetch automatically when coordinates drift. Instead, the feed snapshots the coordinates it was loaded with into a local `feedLocationRef`.
- **Location drift banner**: a tappable banner shown between the header and content (segment 0 only) when the live location has drifted 500+ meters from the feed's snapshot. Tapping the banner, pulling to refresh, or tapping the segment button all reload the feed and re-snapshot the location.
- **Haversine utility**: a small pure function to compute distance between two lat/lon pairs for the drift check.

## Capabilities

### New Capabilities
- `location-drift-banner`: Tappable banner UI that warns the user when their live location has drifted significantly from the location the feed was loaded with, prompting a manual reload.

### Modified Capabilities
- `location-provider`: Add accuracy field to atom, implement 3-phase refinement (seed → high-accuracy GPS → balanced maintenance), accept only equal-or-better accuracy fixes.
- `photo-feed`: Remove auto-reload on coordinate change, add `feedLocationRef` snapshot on reload, show drift banner on segment 0 when drift exceeds 500m, trigger snapshot on all reload paths (pull-to-refresh, segment click, banner tap).

## Impact

- **Files modified**: `src/state.js`, `src/hooks/useLocationProvider.js`, `src/screens/PhotosList/index.js`
- **Files created**: `src/utils/haversine.js`, `src/screens/PhotosList/components/LocationDriftBanner.js`
- **Battery**: Phase 2 uses `Accuracy.High` (GPS) for up to 30 seconds at app startup, then drops to today's Balanced level. Net battery impact is minimal.
- **API calls**: Fewer feed reloads than today (no auto-reload storm during refinement), user-initiated only.
- **Mac Catalyst**: Phase 2 exits via 30-second timeout since Mac has no GPS. WiFi accuracy (~50-100m) is accepted.
- **Photo uploads**: Benefit from refined coordinates — photos captured after the ~10s refinement window get GPS-quality location tags.
