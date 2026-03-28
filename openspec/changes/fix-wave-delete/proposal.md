## Why

The "Delete Wave" action in the WaveDetail screen does not work. The `handleDeleteWave` function is defined **after** it is referenced in the `headerMenuItems` array. Since `const` declarations are not hoisted, the menu item's `onPress` captures `undefined` instead of the function. Tapping "Delete Wave" silently does nothing—no confirmation dialog, no deletion, no navigation.

## What Changes

- Move `handleDeleteWave` definition above `headerMenuItems` in `src/screens/WaveDetail/index.js` so the function reference is valid when the menu array is constructed
- Ensure the confirmation `Alert.alert` fires, the GraphQL `deleteWave` mutation executes on confirm, and `router.back()` navigates to the previous route on success

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `wave-detail`: Fix declaration order so the delete action's `onPress` handler is defined before it is referenced in the header menu items array

## Impact

- **Code**: `src/screens/WaveDetail/index.js` — reorder function declarations (move `handleDeleteWave` above `headerMenuItems`)
- **Behavior**: Delete Wave menu item will show confirmation dialog, execute deletion, and navigate back on success
- **Risk**: Minimal — only changes declaration order within the same component scope
