## Context

The `wavesCount` and `ungroupedPhotosCount` Jotai atoms were introduced in the `waves-onboarding-ux` change. Multiple components now read and write these atoms: WaveHeaderIcon (eager fetch on mount), `waves/index.tsx` (fetch on focus), WavesHub (write after mutations), PhotosList (write after upload), and `usePhotoActions` (write after addPhotoToWave).

Several of these components only need the setter — they never render based on the atom value. Yet they use `useAtom`, which subscribes to reads, causing unnecessary re-renders whenever any other component writes to the same atom.

The primary freeze occurs when navigating from the search photos segment (with keyboard active) to the Waves screen. The WavesHub screen uses `KeyboardStickyView` and `KeyboardAvoidingView` from `react-native-keyboard-controller`, which use Reanimated worklets that subscribe to keyboard events. When these components mount while a keyboard-dismiss animation is in progress, the competing animations saturate the JS thread and freeze the UI.

## Goals / Non-Goals

**Goals:**
- Fix the freeze when navigating from search (keyboard active) to the Waves screen
- Eliminate phantom re-render subscriptions from write-only atom consumers

**Non-Goals:**
- Changing the data flow or atom architecture
- Adding loading skeletons or placeholder UI
- Optimizing the GraphQL queries themselves
- Addressing other screens' navigation performance

## Decisions

### 1. Dismiss keyboard on PhotosList focus loss

**Decision**: Add `Keyboard.dismiss()` in the `useFocusEffect` cleanup of PhotosList so the keyboard is fully dismissed before the destination screen mounts.

**Rationale**: The freeze happens because WavesHub's `KeyboardStickyView` / `KeyboardAvoidingView` (from `react-native-keyboard-controller`) mount while the keyboard-dismiss animation is still in progress. These components use Reanimated worklets that react to keyboard events — mounting them mid-animation creates competing animation frames that saturate the JS thread. By dismissing the keyboard in the cleanup (which runs before the next screen mounts), the keyboard animation completes before the destination screen's keyboard-aware components subscribe to events.

**Alternative considered**: Wrapping `useFocusEffect` bodies in `InteractionManager.runAfterInteractions()` — rejected because it defers data loading unnecessarily and doesn't address the root cause (keyboard animation conflict).

### 2. `useSetAtom` for write-only consumers

**Decision**: Replace `const [, setter] = useAtom(atom)` with `const setter = useSetAtom(atom)` at all sites that destructure away the value.

**Rationale**: `useAtom` internally subscribes to atom reads — even if you destructure away the value, the component re-renders on every external write. `useSetAtom` (from `jotai`) provides only the setter with zero read subscription. This is the idiomatic Jotai pattern for write-only consumers.

**Affected sites:**

| File | Atom | Current | After |
|------|------|---------|-------|
| WavesHub | `wavesCount` | `useAtom` | `useSetAtom` |
| WavesHub | `ungroupedPhotosCount` | `useAtom` | `useSetAtom` |
| PhotosList | `ungroupedPhotosCount` | `useAtom` | `useSetAtom` |
| usePhotoActions | `ungroupedPhotosCount` | `useAtom` | `useSetAtom` |

**Alternative considered**: Splitting atoms into separate read/write atoms — rejected as overengineering; `useSetAtom` is the standard solution.

## Risks / Trade-offs

- [Risk: Keyboard dismiss on every focus loss] `Keyboard.dismiss()` is a no-op when the keyboard isn't visible, so there's no performance cost. When the keyboard is visible, dismissing it before navigation is the desired UX behavior.
- [Risk: Keyboard dismiss timing] `Keyboard.dismiss()` is synchronous and triggers the keyboard hide immediately. The cleanup runs before the next screen's mount, so the keyboard animation completes before keyboard-aware components in the destination screen subscribe to events.
