## Why

Pull-to-refresh on the Waves list screen does not reliably refresh all waves. When a previous `loadWaves` call is still in-flight (slow network, large dataset), the refresh is silently skipped because `loadingRef.current` is not reset before calling `loadWaves`. Additionally, `noMoreData` is not reset and the ungrouped/waves counts are not re-fetched, leaving stale state visible after refresh.

## What Changes

- Reset `loadingRef.current` to `false` in `handleRefresh` before calling `loadWaves`, matching the behavior of `useFocusEffect`
- Reset `noMoreData` to `false` in `handleRefresh` to prevent stale pagination state
- Call `fetchCounts()` in `handleRefresh` to update ungrouped photo and wave counts
- Align `handleRefresh` behavior with `useFocusEffect` so both refresh paths produce identical results

## Capabilities

### Modified Capabilities
- `wave-hub`: Waves List Focus Refresh — pull-to-refresh shall behave identically to focus-based refresh

## Impact

- `src/screens/WavesHub/index.js` — `handleRefresh` function only
- No API, GraphQL, or dependency changes
- No spec file changes required (existing spec already requires focus refresh to reset these states; pull-to-refresh is an equivalent user-initiated refresh)
