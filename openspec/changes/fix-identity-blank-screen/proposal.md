## Why

The identity screen renders blank on real iOS devices. The `SafeAreaView` container renders (correct background color visible) but all content is invisible. Root cause: a `fadeAnim` (`Animated.Value(0)`) drives opacity on an `Animated.View` wrapping all content. When `nickNameEntered` state changes asynchronously (from SecureStore read), the component switches JSX branches, mounting a new native `Animated.View` node. The running animation was attached to the old node; the new node reads `fadeAnim`'s JS-side value which is still `0` (because `useNativeDriver: true` doesn't update the JS value mid-animation). The animation effect only depends on `[hasSeenExplainer]`, which doesn't change, so it never re-fires for the new view.

## What Changes

- Remove the fade-in animation (`fadeAnim`, `scaleAnim`) from the identity screen entirely. The navigation system already provides enter/exit transitions; the animation adds no meaningful UX value but introduced this device-only bug.
- Remove the `Animated` import and `Animated.View` wrappers from all three render branches (active identity, privacy explainer gate, creation flow).
- Content renders immediately without opacity animation.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none — this is a bug fix removing broken animation code; no spec-level behavior changes)

## Impact

- `src/screens/Secret/index.js` — remove animation refs, effect, and `Animated.View` wrappers
- No API, dependency, or external system changes
- No breaking changes
