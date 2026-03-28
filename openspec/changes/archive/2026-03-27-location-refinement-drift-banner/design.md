## Context

The location provider (`src/hooks/useLocationProvider.js`) currently uses a single `watchPositionAsync` with `Accuracy.Balanced` and `distanceInterval: 100`. This never engages GPS, so the device position stays at whatever coarse fix the OS cached (cell tower / WiFi, typically 100-800m accuracy). The `locationAtom` stores `{ status, coords }` with no accuracy information, so there's no way to compare fixes. Additionally, the PhotosList auto-reloads the geo feed on every coordinate change, which would cause an API storm if the location were refining rapidly.

The feed uses `locationAtom.coords` to query the backend for nearby photos. Photo uploads snapshot `locationAtom.coords` at capture time, permanently tagging the photo with whatever accuracy was available.

## Goals / Non-Goals

**Goals:**
- Refine location from coarse to GPS-quality within ~10-30 seconds of app startup
- Only accept location fixes that are equal or better accuracy than the current stored fix
- Give the user control over when the feed reloads for a new location (no auto-reload on coordinate drift)
- Show a clear, non-intrusive banner when the feed's location is stale relative to the live location
- Improve photo upload geo-tagging accuracy by having better coordinates available sooner
- Preserve battery life by dropping back to low-power monitoring after refinement

**Non-Goals:**
- Continuous high-accuracy GPS tracking (too battery-intensive)
- Showing the user their exact accuracy in meters (internal detail)
- Changing the backend feed query radius or logic
- Adding location accuracy to the upload API (backend change)

## Decisions

### Decision 1: 3-phase location refinement

**Choice:** Implement three sequential watcher phases in `useLocationProvider`:
1. **Seed** — `getLastKnownPositionAsync()`, accept any accuracy, show feed immediately
2. **Refine** — `watchPositionAsync` with `Accuracy.High`, `distanceInterval: 0`, `timeInterval: 1000` for up to 30 seconds or until accuracy < 50m
3. **Maintain** — `watchPositionAsync` with `Accuracy.Balanced`, `distanceInterval: 100`, `timeInterval: 60000` (today's settings)

**Rationale:** This gives the best of all worlds — instant display from cache, GPS-quality refinement, then battery conservation. The 30s timeout ensures Mac (no GPS) doesn't spin forever. The 50m threshold captures the point where GPS has converged to a useful fix.

**Alternatives considered:**
- *Single High-accuracy watcher forever* — too battery-intensive for ongoing use
- *Just change Balanced → High with no phases* — simple but wastes battery continuously after convergence
- *Request a single `getCurrentPositionAsync(High)`* — this call hangs on Mac Catalyst (same issue as `requestForegroundPermissionsAsync`)

### Decision 2: Accuracy-gated atom updates

**Choice:** Store `accuracy` (horizontal accuracy in meters, from `coords.accuracy`) in `locationAtom`. Only update the atom when the new fix has `accuracy <= storedAccuracy` (lower = better).

**Rationale:** `expo-location`/OS do not guarantee monotonically improving fixes. A GPS fix can be followed by a cell-tower fix with worse accuracy. Without gating, the atom could regress to a worse position. The accuracy field also lets downstream consumers (future) make decisions based on precision.

**Alternatives considered:**
- *Always accept latest fix* — current behavior, allows accuracy regression
- *Hysteresis with cooldown* — over-engineered for this use case

### Decision 3: Feed location snapshot with drift banner (not auto-reload)

**Choice:** The feed stores the coordinates it was loaded with in a `feedLocationRef`. The auto-reload effect that fires on `[coords?.lat, coords?.lon]` is replaced with a status-only effect that fires on `[locationState.status]` (pending → ready transition). A `LocationDriftBanner` appears on segment 0 when `haversine(feedLocation, liveCoords) > 500m`. All reload paths (`reload()`) snapshot the current atom coords into `feedLocationRef`.

**Rationale:** The user asked for explicit control — no surprise content replacement. The 500m threshold corresponds to "different area" which aligns with the backend feed radius behavior. The banner is non-intrusive and dismisses naturally when any reload occurs.

**Alternatives considered:**
- *Auto-reload with debounce* — still causes surprise content changes, rejected by user
- *Accuracy-threshold reload (only reload when accuracy crosses a band)* — clever but still auto-reloads
- *Option C from exploration: reload on phase transition only* — doesn't handle user movement during Phase 3

### Decision 4: Haversine utility as pure function

**Choice:** A `src/utils/haversine.js` module exporting a single pure function `haversine(lat1, lon1, lat2, lon2) → meters`. No external dependency.

**Rationale:** The formula is ~10 lines. Adding a geo library for one function is unnecessary. Pure function is trivially testable.

### Decision 5: LocationDriftBanner styled like PendingPhotosBanner

**Choice:** A new component at `src/screens/PhotosList/components/LocationDriftBanner.js`, rendered between the header and content, only on segment 0. Tappable — calls `reload()`. Uses the same card styling as `PendingPhotosBanner` for visual consistency (themed card with icon, text, rounded corners).

**Rationale:** Consistent with existing banner patterns in the app. Positioned where the user naturally looks. Tappable provides a direct action path.

## Risks / Trade-offs

- **[Phase 2 battery on older devices]** → Mitigated by 30-second hard cap. GPS engagement for 30s is minimal battery impact (comparable to opening Maps briefly).
- **[Mac Catalyst has no GPS]** → Phase 2 will exit via timeout after 30s with WiFi-level accuracy (~50-100m). This is fine — Mac users are stationary.
- **[500m threshold too sensitive or too lax]** → 500m is a starting point. Can be tuned via a constant. For dense cities 200m might be better; for rural areas 1km. Starting with 500m and adjusting based on feedback.
- **[User ignores drift banner]** → No negative consequence. The feed shows slightly stale photos. The banner remains visible until they act. No data loss or corruption.
- **[Phase transition race: Phase 2 watcher removed before Phase 3 watcher starts]** → Brief gap where no watcher is active. Mitigated by starting Phase 3 watcher before removing Phase 2 subscription.
