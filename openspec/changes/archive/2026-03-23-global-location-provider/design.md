## Context

Location is currently managed as local React state inside `useLocationInit`, called independently by `PhotosList` and `WaveDetail` on mount. It performs a one-shot `getCurrentPositionAsync` with no retry, no ongoing updates, and no shared state. A failure leaves the screen permanently stuck with `null` location. The `PhotosListFooter` hides entirely when location is unavailable, giving the user no indication of what's happening or how to fix it.

The app uses Jotai for global state (`uuid`, `isDarkMode`, `nickName`, etc.) and follows the pattern of calling `useAtom(STATE.someAtom)` in screens. `expo-location` v55.1.4 is already installed and `Location.watchPositionAsync` is available.

## Goals / Non-Goals

**Goals:**
- Initialize location once at app startup, shared across all screens via Jotai atom
- Provide continuous location updates as the user moves (for geo feed relevance)
- Distinguish between "GPS pending" and "permission denied" states in the UI
- Show the app immediately with location-dependent features disabled, enabling them as location becomes available
- Fast-seed with `getLastKnownPositionAsync` for near-instant initial state
- Retry watcher startup on failure (up to 3 attempts)
- Always render camera/video buttons (visible but disabled) so users know they exist

**Non-Goals:**
- Background location tracking (app only needs foreground location)
- High-precision GPS (Balanced accuracy is sufficient for geo feed proximity)
- Web platform location support (location features are mobile-only)
- Changing the upload pipeline's location validation (it already validates at queue and upload time)

## Decisions

### 1. Atom shape: status + coords object

**Decision**: The `locationAtom` stores `{ status, coords }` where `status` is one of `'pending'`, `'denied'`, or `'ready'`, and `coords` is `null` or `{ latitude, longitude }`.

**Rationale**: Three distinct states drive three distinct UI treatments. Storing extracted `latitude`/`longitude` in `coords` (rather than the full Expo location object) keeps the atom minimal and simplifies consumers. The atom starts as `{ status: 'pending', coords: null }`.

**Alternative considered**: Separate atoms for status and coords — rejected because they always change together and would require coordinated updates.

### 2. `watchPositionAsync` with Balanced accuracy

**Decision**: Use `Location.watchPositionAsync` with `{ accuracy: Location.Accuracy.Balanced, distanceInterval: 100, timeInterval: 60000 }`.

**Rationale**: Provides the initial fix AND continuous updates in one mechanism. `Balanced` accuracy is sufficient for the geo feed's proximity radius. `distanceInterval: 100` (meters) and `timeInterval: 60000` (ms) keep updates infrequent when stationary, conserving battery. `BestForNavigation` (current setting) is unnecessarily precise and slower to lock.

**Alternative considered**: Keep one-shot `getCurrentPositionAsync` with retry loop — rejected because it doesn't provide ongoing updates and requires separate retry logic.

### 3. Fast-seed with `getLastKnownPositionAsync`

**Decision**: Before starting the watcher, call `getLastKnownPositionAsync()`. If it returns a valid position, immediately set the atom to `ready` with those coords. The watcher then refines the position when a fresh fix arrives.

**Rationale**: Last-known position returns in <100ms (cached by the OS). This makes the feed usable almost immediately. The position may be stale (hours/days old if user traveled), but for the geo feed it's better than showing nothing — the watcher will update it within seconds.

### 4. Watcher startup retry (max 3 attempts, 5s delay)

**Decision**: If `watchPositionAsync` throws, wait 5 seconds and retry up to 3 times. After 3 failures, the atom stays in its current state (either `pending` if no last-known position, or `ready` with stale coords). The UI shows a "Retry" action in the banner.

**Rationale**: Watcher failures are rare (buggy GPS drivers, simulator edge cases) but when they happen, a simple retry usually succeeds. Three attempts with 5s gaps covers transient OS-level init delays. No exponential backoff needed — this retries the watcher *startup*, not position fetches.

### 5. Provider hook in `src/hooks/useLocationProvider.js`, called from `_layout.tsx`

**Decision**: Isolate all location logic (permission, fast-seed, watcher, retry, atom writes) in a dedicated hook. Call it once from the root `_layout.tsx`.

**Rationale**: Keeps `_layout.tsx` clean (one line call). The hook is self-contained and testable. Follows the existing pattern where `_layout.tsx` orchestrates app-level concerns (fonts, deep links, theme) via hooks.

### 6. `PhotosListFooter` always renders, buttons disabled

**Decision**: Remove the `if (!location) return null` guard. Always render the footer. Camera and video buttons get `disabled` prop and reduced opacity (0.4) when `location.status !== 'ready'`. A small location-pin indicator can show the pending state.

**Rationale**: Hidden footer gives zero user feedback. Visible-but-disabled buttons communicate "this exists but isn't available yet." Consistent with the ActionMenu disabled-item pattern (opacity 0.4).

### 7. `useLocationInit` deletion

**Decision**: Delete `src/screens/PhotosList/hooks/useLocationInit.js` after all consumers are migrated to the atom.

**Rationale**: No consumers will remain. Keeping it would invite confusion about which location source to use. Clean break.

## Risks / Trade-offs

- [Last-known position may be very stale] → Acceptable trade-off: user sees *some* feed immediately. Watcher refines within seconds. If user traveled far, the feed auto-refreshes with new coords.
- [Watcher runs continuously in foreground] → Battery impact is minimal with `Balanced` accuracy, 100m distance interval, and 60s time interval. This is standard for location-based apps.
- [`watchPositionAsync` may not fire on iOS simulators without simulated location] → Development concern only. Add a note in README or dev docs. Not a production issue.
- [Permission request fires immediately at app startup, before user context] → The current app already requests on PhotosList mount (the main screen). Moving it to `_layout.tsx` changes timing minimally. If needed later, could defer to first screen that needs it.
- [Atom update triggers re-renders in all consumers] → Mitigated by the 100m/60s throttle on watcher updates. Most renders are the initial pending→ready transition (once). Subsequent updates are infrequent.
