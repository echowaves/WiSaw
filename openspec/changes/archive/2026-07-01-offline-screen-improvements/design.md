## Context

The PhotosList screen (`src/screens/PhotosList/index.js`) displays an offline card when `netAvailable` is `false`. The card currently shows:

- Title: "No Internet Connection"
- Subtitle: "You can still take photos offline. They'll be uploaded automatically when you're back online."
- Action: "Try Again" → calls `reload()`, which has `if (!location) return` at the top

The problem is twofold:
1. The subtitle implies photos can be taken immediately, but photo capture requires location determination (GPS) first
2. The "Try Again" handler (`reload()`) silently does nothing when location hasn't resolved yet — users get no feedback

Location flows through `locationAtom` (status: `pending` → `ready`/`denied`/`unavailable`), managed by `useLocationProvider.js` with a 3-phase GPS strategy (last-known → high-accuracy refinement → long-term watcher).

The offline guard spec (`openspec/specs/offline-guard/spec.md`) requires screens to display an `EmptyStateCard` with `icon='wifi-off'` when offline. The spec does not dictate the subtitle text or action button behavior.

## Goals / Non-Goals

**Goals:**
- Make the offline card communicate accurately: photos require location determination
- Make "Try Again" actually do something useful — force-check GPS and refresh the feed
- Keep the change minimal and scoped to PhotosList

**Non-Goals:**
- No changes to the offline guard spec itself (behavior is unchanged)
- No changes to other screens' offline cards
- No changes to the location provider (3-phase GPS strategy stays as-is)
- No changes to drawer offline behavior

## Decisions

### Decision 1: Use `useSetAtom` at component level for `setLocation`

**Choice:** Extract `setLocation = useSetAtom(STATE.locationAtom)` at the component top level, and use it inside the `handleTryAgain` callback.

**Rationale:** React hooks cannot be called inside callbacks (they must be called at the top level of the component). Since `handleTryAgain` needs to update `locationAtom`, we must extract the setter at the component level.

**Alternatives considered:**
- Using `useAtom` destructuring (`const [, setLocation] = useAtom(STATE.locationAtom)`) — functionally equivalent but `useSetAtom` is more explicit about intent (we only need the setter)
- Using a ref to store the setter — overkill for this simple case

### Decision 2: Force GPS via `Location.getCurrentPositionAsync()`

**Choice:** Call `Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })` to get a fresh GPS fix, then update `locationAtom` directly.

**Rationale:** This is the same API used elsewhere in the app (e.g., `useLocationProvider.js` uses `getLastKnownPositionAsync`). `Balanced` accuracy provides a good tradeoff between speed and precision. The location provider's phase system continues running in the background — this just gives an immediate fix.

**Alternatives considered:**
- Using `Location.requestForegroundPermissionsAsync()` — not needed, the provider already handles permission
- Using `Location.watchPositionAsync()` — overkill for a single-shot refresh
- Just calling `reload()` — silently does nothing when location isn't ready

### Decision 3: Subtitle text change only, no conditional text

**Choice:** Change the subtitle to a single static message: "You can take photos when your location is determined. They'll be uploaded automatically when you're back online."

**Rationale:** The user explicitly requested "just make the subtitle accurate." Conditional text based on location state adds complexity and the current offline card already shows the location banner above the fold (via `PendingPhotosBanner`) when location is pending/denied.

**Alternatives considered:**
- Conditional subtitle based on `locationState.status` — more informative but adds branching logic for a single screen
- Adding a secondary "Check Location" action button — scope creep beyond user's request

## Risks / Trade-offs

[Risk] `Location.getCurrentPositionAsync` may fail silently in some environments (simulator, indoor)
→ GPS errors are caught and logged in dev mode only. `reload()` is still called afterward, which will resolve the feed when location becomes ready via the background provider.

[Risk] Forcing GPS may consume extra battery
→ `Balanced` accuracy is a moderate GPS request. The user explicitly tapped "Try Again," indicating intent. This is a one-shot call, not a continuous watcher.

[Risk] `setLocation` updates may conflict with the background location provider
→ The provider's `storedAccuracyRef.current` gate ensures only better (lower) accuracy values are accepted. A fresh GPS fix from `getCurrentPositionAsync` will typically be more accurate than the last-known seed, so it will be accepted. The provider's Phase 2/3 will continue running and may overwrite with even better fixes.