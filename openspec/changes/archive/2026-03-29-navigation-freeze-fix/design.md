## Context

PhotosList is a complex screen with ~1200 lines managing 3 segments (Global, Starred, Search), location-based feeds, upload queues, and friendship data. Key functions `load()` and `reload()` are plain async functions (not memoized) that fire multiple network requests and setState calls. Neither is cancellable — once called, they run to completion even if the user has navigated away or switched segments.

Current state of the problem:
- `reload()` is fire-and-forget (not awaited in `updateIndex`)
- `reload()` does `setPageNumber(null)` then `setPageNumber(0)` — the second triggers a `useEffect([pageNumber])` that calls `load()` with a **stale closure** (load is not in the dependency array)
- This means every segment switch triggers `reload()` → `load()` (explicit) PLUS `load()` (via pageNumber effect) = 2× concurrent network+setState chains
- Location status effect fires `reload()` again when GPS becomes ready (cold start timing)
- Navigation icons use `router.push()` which stacks duplicates on double-tap

## Goals / Non-Goals

**Goals:**
- Eliminate the UI freeze when rapidly switching segments then navigating to Waves
- Cancel in-flight PhotosList work (network requests, setState) when the screen loses focus
- Prevent duplicate screen pushes on double-tap of navigation icons
- Fix the stale-closure bug in the pageNumber useEffect

**Non-Goals:**
- Refactoring PhotosList into smaller components (out of scope, too risky)
- Adding Apollo cache (currently all queries use `fetchPolicy: 'no-cache'`)
- Memoizing `load()`/`reload()` with useCallback (high-risk refactor due to massive closure dependencies)

## Decisions

### 1. AbortController for reload/load cancellation

Use a component-scoped `AbortController` ref to cancel in-flight `reload()`/`load()` chains. Every time `reload()` is called, abort the previous controller and create a new one. Check `signal.aborted` before each setState call in the async chain.

**Why not useCallback + cleanup?** `reload()` and `load()` capture 15+ closure variables. Wrapping them in useCallback would require listing all dependencies and risks breaking existing behavior. An AbortController is orthogonal — it layers cancellation on top of the existing code without restructuring it.

**Why not isFocused guard?** `useIsFocused()` is already imported but only used for T&C modal. We could check it in load/reload, but it doesn't help with the segment-switch case (screen is still focused). AbortController handles both cases.

### 2. Remove the pageNumber useEffect entirely

The `useEffect([pageNumber])` that calls `load()` was originally needed for pagination (onEndReached sets pageNumber, effect calls load). But `reload()` already calls `load()` directly after resetting pageNumber. The effect causes a **duplicate** load on every reload. 

Instead: call `load()` explicitly from the pagination handler (`setPageNumber` call sites in the masonry/footer) and remove the effect. This eliminates the stale closure entirely.

**Alternative considered:** Add `load` to the dependency array. Rejected because `load` is not memoized, so this would cause the effect to re-run on every render.

### 3. Cancel on screen blur via useFocusEffect cleanup

Add a `useFocusEffect` cleanup that aborts the current AbortController when PhotosList loses focus (user navigates to Waves, drawer item, etc.). This ensures background async work doesn't keep firing setState on an unfocused screen.

### 4. router.navigate() for drawer-sibling navigation

Replace `router.push()` with `router.navigate()` in WaveHeaderIcon, IdentityHeaderIcon popover, and PhotosListFooter friends button. `router.navigate()` is idempotent for screens already in the navigation state — it focuses the existing instance rather than pushing a duplicate.

**Why not debounce?** `router.navigate()` solves the problem at the right layer (navigation API) without timers or refs. Debounce would be a workaround for the wrong API choice.

## Risks / Trade-offs

- [Risk: Removing pageNumber effect breaks pagination] The onEndReached pagination handler currently relies on `setPageNumber(n+1)` triggering the effect to call `load()`. After removing the effect, we must add an explicit `load()` call in the pagination handler. → Mitigation: Trace all `setPageNumber` call sites and ensure each one that needs a load() call gets one directly.
- [Risk: AbortController check points missed] If a setState call happens between abort-check points, stale state could still be set. → Mitigation: Check `signal.aborted` immediately before each setState call in load/reload, and after each `await`.
- [Risk: router.navigate() changes back-button behavior] `navigate()` may not push a new stack entry, changing back-button UX. → Mitigation: These are drawer-sibling screens, not stack children. Back button already navigates to drawer home, unaffected.
