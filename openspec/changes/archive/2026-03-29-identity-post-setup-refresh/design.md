## Context

The SecretScreen (`src/screens/Secret/index.js`) manages identity creation via three render branches: active identity view, privacy explainer gate, and creation flow. A fade animation (`Animated.Value(0)` → 1) runs once in `useEffect([])` on mount. When the privacy explainer is dismissed mid-animation, the `Animated.View` in the creation flow re-mounts with `fadeAnim` stuck at its interrupted value (often 0), rendering an invisible screen.

Separately, after successful identity registration (`handleSubmit`), the `nickName` Jotai atom is updated but no screen outside SecretScreen subscribes to it. PhotosList (watchers tab), WavesHub, and FriendsList all query using `uuid` and have no mechanism to know identity was just established. The existing `friendAddBus.js` event pattern provides a proven model for cross-screen event communication.

## Goals / Non-Goals

**Goals:**
- Fix the blank screen after privacy explainer dismissal so the creation form is visible immediately
- Notify dependent screens (PhotosList, WavesHub, FriendsList) when identity changes so they reload data
- Follow the existing event bus pattern (`friendAddBus.js`) for consistency

**Non-Goals:**
- Refactoring the privacy explainer into a separate route/modal
- Adding focus-based reload to PhotosList (this was considered but would add unnecessary network traffic)
- Changing the query variables (uuid vs nickName) used by any screen

## Decisions

### 1. Re-trigger animation on `hasSeenExplainer` change

**Decision**: Make the animation `useEffect` depend on `hasSeenExplainer` and reset `fadeAnim` to 0 before re-animating.

**Rationale**: The root cause is that `useEffect([])` fires once and the `Animated.View` gets removed from the tree when the explainer shows. When the creation flow re-renders after dismissal, `fadeAnim` is stuck at its interrupted native-driver value. By adding `hasSeenExplainer` as a dependency and resetting before animating, the creation flow always fades in properly.

**Alternative considered**: Moving animation to each render branch — rejected because it would duplicate animation logic across three branches.

### 2. Event bus for identity changes

**Decision**: Create `src/events/identityChangeBus.js` mirroring `friendAddBus.js` — a `Set`-based listener pattern with `subscribeToIdentityChange()` and `emitIdentityChange()`.

**Rationale**: This is the established pattern in the codebase. It's simple, has no external dependencies, and decouples the identity screen from consuming screens. The event fires exactly once at the right moment — after successful `handleSubmit` or `handleReset`.

**Alternative considered**: Watching the `nickName` atom with `useEffect` — rejected because it would fire during text editing (before submit) and couples screens to knowledge of which atom represents identity state.

### 3. Subscribe and reload in each screen

**Decision**: Each screen (PhotosList, WavesHub, FriendsList) subscribes to identity-change events in a `useEffect` and calls its existing `reload()` function when the event fires.

**Rationale**: Every screen already has a `reload()` or equivalent function. Subscribing in a `useEffect` with cleanup (unsubscribe on unmount) follows React conventions and prevents memory leaks.

## Risks / Trade-offs

- [Risk: Event fires while screen is unfocused] → The screen's `reload()` will still execute. This is acceptable — the data will be fresh when the user navigates to it. In PhotosList, the `AbortController` pattern will cancel the reload if the user navigates away before it completes.
- [Risk: Multiple identity changes in quick succession] → Each `emitIdentityChange()` triggers a reload in all subscribed screens. The existing `AbortController` in PhotosList handles this (previous reload is aborted). WavesHub and FriendsList set loading state that prevents concurrent fetches.
