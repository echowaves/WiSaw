## Why

The "Your location has updated" drift banner in PhotosList does not dismiss when tapped. The banner's `onPress` calls `reload()`, which snapshots the current location into `feedLocationRef` (a ref), but the `showDriftBanner` useMemo only depends on `activeSegment` and `locationState.coords` — neither changes on tap, so useMemo returns its cached `true` value and the banner stays visible. The banner clears when switching segments only because `activeSegment` (a state dep) changes.

## What Changes

- Add a `feedLocationVersion` state counter that increments whenever `reload()` snapshots the location into `feedLocationRef`
- Include `feedLocationVersion` in the `showDriftBanner` useMemo dependency array so it recalculates after the snapshot, sees drift ≈ 0m, and hides the banner

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `location-drift-banner`: Add requirement that tapping the banner immediately dismisses it by forcing the drift recalculation after the feed location snapshot

## Impact

- **Code**: `src/screens/PhotosList/index.js` — one new state variable, one `setState` call in `reload()`, one added dep in useMemo
- **Behavior**: Tapping the drift banner now reliably dismisses it and refreshes the feed
- **Risk**: Minimal — adds one lightweight state counter
