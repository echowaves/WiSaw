## Context

The current `useLocationProvider` hook implements a 3-phase location initialization strategy:

1. **Phase 1**: Fast-seed with `getLastKnownPositionAsync()` - Blocks indefinitely if system location service not ready
2. **Phase 2**: High-accuracy refinement with 60s timeout
3. **Phase 3**: Maintenance watcher with 3 retry attempts

**Current Problem:** On fresh iOS device boot, `getLastKnownPositionAsync()` can block for 30-60+ seconds before the system location service initializes. Users see a hung app with no feedback. The only workaround is to restart the app.

**Constraints:**
- Must maintain backward compatibility with existing status values
- Should work on iOS, Android, and Mac Catalyst
- No new dependencies allowed (must use existing `expo-location` API)
- Must handle Mac Catalyst permission request hangs (existing 5s timeout)

## Goals / Non-Goals

**Goals:**
- Eliminate indefinite blocking on `getLastKnownPositionAsync()` with 5s timeout
- Add timeout protection to Phase 3 watcher setup (10s timeout)
- Add watchdog mechanism to detect and recover from stuck watchers (30s no-update detection)
- Provide clear status transitions for debugging and UI feedback
- Maintain all existing functionality while adding resilience

**Non-Goals:**
- Not changing the 3-phase architecture (too invasive)
- Not changing accuracy-gated updates (working as intended)
- Not changing permission request logic (already handles Mac Catalyst)
- Not adding background location support (out of scope)
- Not implementing exponential backoff (overkill for this issue)

## Decisions

### Decision 1: Keep 3-Phase Architecture, Add Timeouts
**Why:** The 3-phase approach is working well when location services are available. Changing it would be too invasive and risky. Instead, we add timeout guards to each phase.

**Alternatives Considered:**
- Skip Phase 1 entirely → Would delay location acquisition unnecessarily
- Use only Phase 3 from start → Loses fast-seed benefit
- Parallel execution → Complex coordination, race conditions

**Implementation:**
```javascript
const PHASE1_TIMEOUT_MS = 5000
const PHASE3_SETUP_TIMEOUT_MS = 10000
```

### Decision 2: Use `Promise.race()` for Timeouts
**Why:** React Native's `setTimeout` doesn't interrupt async operations. `Promise.race()` with a timeout promise is the only reliable way to enforce timeouts.

**Alternative:** `AbortController` → Not available in React Native by default

**Implementation:**
```javascript
await Promise.race([
  Location.getLastKnownPositionAsync(),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('timeout')), PHASE1_TIMEOUT_MS)
  )
])
```

### Decision 3: Watchdog for Active Watcher
**Why:** Even after Phase 3 starts, the watcher can become unresponsive (iOS bug, system resource pressure). Need a heartbeat mechanism to detect and recover.

**Implementation:**
```javascript
let lastUpdateRef = useRef(Date.now())
setInterval(() => {
  if (Date.now() - lastUpdateRef.current > WATCHDOG_TIMEOUT_MS) {
    restartWatcher()
  }
}, WATCHDOG_CHECK_INTERVAL_MS)
```

### Decision 4: New Status Values for Better Feedback
**Why:** Current statuses (`pending`, `ready`, `denied`) don't distinguish between:
- Location service unavailable vs. just slow
- Initialization timeout vs. permission denied

**New Status Values:**
- `timeout`: Initialization took too long, proceed without location
- `unavailable`: Location services disabled or not available

**Rationale:** These allow UI to show appropriate messages and prevent indefinite waiting.

### Decision 5: Skip Phase 2 on Fresh Boot (Optional Optimization)
**Why:** Phase 2 (high-accuracy GPS) can take 30-60s on cold start. If Phase 1 times out, Phase 2 is unlikely to succeed quickly either.

**Trade-off:** May get less accurate initial location, but app becomes usable faster.

**Decision:** Not implemented in first pass - keep Phase 2 for now, focus on fixing the blocking issue. Can optimize Phase 2 later if needed.

## Risks / Trade-offs

**Risk:** Adding timeouts may result in slower location acquisition on devices where location services are slow but working.

**Mitigation:** 
- 5s timeout still allows most devices to get last-known position
- Watchdog ensures stuck watchers are recovered
- Phase 3 still provides location eventually

**Risk:** Watchdog may restart watcher unnecessarily during brief signal loss.

**Mitigation:** 
- 30s threshold is generous (GPS can take time to re-acquire)
- Only restarts if watcher subscription exists but no callbacks
- Watchdog runs every 15s (half the threshold) to catch issues early

**Risk:** New status values (`timeout`, `unavailable`) may require UI updates.

**Mitigation:** 
- All existing screens already handle `pending` and `denied` states
- `timeout` behaves like `pending` but with message
- `unavailable` shows clear error state
- No breaking changes to existing behavior

**Risk:** Increased complexity may introduce new bugs.

**Mitigation:** 
- Changes are additive (new timeouts, new watchdog)
- Existing logic preserved, just wrapped in timeouts
- Well-tested patterns (Promise.race, useRef, setInterval)
- Comprehensive logging in dev mode for debugging

## Migration Plan

1. **Code Changes:**
   - Add new constants (timeouts, watchdog intervals)
   - Add new status values to `locationAtom`
   - Wrap `getLastKnownPositionAsync()` in timeout
   - Add timeout to Phase 3 watcher setup
   - Add watchdog mechanism for watcher callbacks

2. **Testing:**
   - Test on iOS simulator with location set to "None" (triggers timeout)
   - Test on iOS device with location services disabled
   - Test on iOS device fresh boot (main scenario)
   - Test Android device with slow location acquisition
   - Test Mac Catalyst permission hang scenario (existing)

3. **Rollback Strategy:**
   - Changes are isolated to `useLocationProvider.js`
   - Can revert by replacing the file with previous version
   - No database or migration changes needed
   - No backend changes required

4. **Monitoring:**
   - Log all phase transitions with timestamps
   - Log timeout occurrences with stack traces
   - Monitor `locationAtom` state distribution in production

## Open Questions

1. **Should Phase 2 timeout be reduced?** Current 60s is too long for user experience. Consider reducing to 30s or skipping Phase 2 entirely if Phase 1 times out.

2. **Should watchdog check interval be configurable?** Current 15s is conservative. Could reduce to 10s if needed.

3. **Should we show "initializing location..." UI immediately?** Currently splash screen may hang. Consider showing progress indicator during initialization phase.

4. **Should we fall back to network location if GPS is unavailable?** `getLastKnownPositionAsync()` with `maximumAge` parameter already does this to some extent. May not be necessary.
