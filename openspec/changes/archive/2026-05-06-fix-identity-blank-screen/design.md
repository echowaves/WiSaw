## Context

The identity screen (`src/screens/Secret/index.js`) uses `Animated.Value` refs (`fadeAnim`, `scaleAnim`) to fade in content on mount. The animation was originally keyed on `[]` (mount only) but was changed to `[hasSeenExplainer]` during the expo-storage migration. This introduced a race condition: when `nickNameEntered` changes asynchronously, the component switches JSX return branches, creating a new native `Animated.View` node. The old animation (running on the native thread via `useNativeDriver: true`) is attached to the discarded node. The new node reads `fadeAnim`'s JS-side value (`0`) and no effect re-fires to animate it.

## Goals / Non-Goals

**Goals:**
- Fix the blank identity screen on real iOS devices
- Simplify the component by removing unnecessary animation complexity

**Non-Goals:**
- Adding new animations or transitions
- Refactoring the screen's branching render logic

## Decisions

**Remove animation entirely rather than fix the dependency array**

Alternatives considered:
1. Add `nickNameEntered` to the effect dependency — would fix the bug but preserves unnecessary complexity and leaves a fragile coupling between animation and async state
2. Remove animation entirely — eliminates the bug class, simplifies the component, no UX regression since navigation provides its own transitions

Chose option 2. The 600ms fade-in is redundant with the navigation transition and the `scaleAnim` spring (which animates from 1 to 1) was a noop.

## Risks / Trade-offs

[Slightly less polished explainer→form transition] → Only happens once per user ever. Acceptable.
