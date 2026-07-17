## Why

Tapping a wave in the Waves list crashes the app with a `ReferenceError: Property 'pendingPhotosAnimation' doesn't exist`. Two `Animated.Value` variables (`pendingPhotosAnimation` and `uploadIconAnimation`) are referenced in a `useEffect` block but were never declared — their UI consumers were removed in a prior refactor, leaving orphaned animation code.

## What Changes

- Remove the dead `useEffect` block in `src/screens/WaveDetail/index.js` (lines ~173–201) that references undeclared `pendingPhotosAnimation` and `uploadIconAnimation` variables
- No new capabilities, no behavioral change — purely dead code elimination

## Capabilities

### New Capabilities
(None — this is a bug fix)

### Modified Capabilities
- `wave-detail`: Remove orphaned animation side-effect that causes runtime crash on screen mount

## Impact

- **File**: `src/screens/WaveDetail/index.js` — remove ~30 lines of dead animation code
- **No spec-level behavior change**: animation values were not connected to any UI element
