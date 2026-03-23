## Why

The auto-group operation can take significant time when grouping many photos (the API processes in batches with a `do-while hasMore` loop). Currently, after the user confirms the action, the app shows no visual feedback — the `autoGrouping` state exists but is never rendered. The user stares at a seemingly frozen screen until a success toast finally appears. This is a poor experience that may lead users to think the app is broken or to trigger duplicate actions.

## What Changes

- Add a semi-transparent overlay with an ActivityIndicator and running progress text during auto-grouping
- The overlay updates after each batch with the number of photos grouped and waves created so far
- The overlay prevents interaction with the underlying UI during the operation
- Wire the existing `autoGrouping` state to control overlay visibility

## Capabilities

### New Capabilities

_None_

### Modified Capabilities

- `auto-group-photos`: The auto-group operation SHALL display a progress overlay during execution, updating after each batch with counts of photos grouped and waves created

## Impact

- **Files**: `src/screens/WavesHub/index.js` (overlay rendering + progress state updates in the loop)
- **No new dependencies** — uses existing `Modal`, `ActivityIndicator`, `View`, `Text` from react-native
