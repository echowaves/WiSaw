## Context

In `src/screens/WaveDetail/index.js`, the component defines `headerMenuItems` (an array of menu actions) before `handleDeleteWave` (the delete handler). Since `const` is not hoisted, `handleDeleteWave` is `undefined` when the menu array captures it. The `useImperativeHandle` dependency array also omits the menu-related references, though this is secondary to the ordering bug.

WavesHub's equivalent delete flow works correctly because its `handleDeleteWave` is defined before `contextMenuItems`.

## Goals / Non-Goals

**Goals:**
- Fix the declaration order so `handleDeleteWave` is defined before `headerMenuItems` references it
- Ensure the existing confirmation dialog, mutation call, and `router.back()` navigation all execute correctly

**Non-Goals:**
- Adding new delete UX or flows
- Changing the WavesHub delete flow (already working)
- Modifying the `useImperativeHandle` dependency array (functional without it since `showHeaderMenu` just sets state)

## Decisions

**Move `handleDeleteWave` above `headerMenuItems`** — This is the minimal, correct fix. The function body stays identical; only its position in the file changes. This mirrors the working pattern in WavesHub where handlers are defined before the menu items array that references them.

Alternative considered: wrapping the `onPress` in an arrow function (`() => handleDeleteWave()`) to defer resolution. This would also work due to closure semantics, but reordering is cleaner and matches the existing codebase pattern.

## Risks / Trade-offs

- **Risk**: None — this is a pure declaration reorder within the same function scope. No logic changes.
