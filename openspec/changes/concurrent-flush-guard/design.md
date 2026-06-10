## Context

Two independent concurrency issues cause the freeze:

**Issue 1: Flush scheduling on empty queues and duplicate timers**
The old code scheduled a 5-second flush timer every time `processQueue()` found an empty queue — including on app startup, pull-to-refresh, or navigation where no uploads occurred. Multiple drains stacked duplicate timers.

**Issue 2: Concurrent runAutoGroup execution**
`runAutoGroup()` in `WavesHub/index.js` has no guard against concurrent execution. Multiple triggers (upload flush, UngroupedPhotosCard button, WavesExplainerView button, silent events) all call `emitAutoGroup()` which broadcasts to all subscribers. If two triggers fire while one `runAutoGroup` is mid-execution, the second resets progress state (`setAutoGroupProgress({photosGrouped: 0...})`) and starts a new auto-group loop, causing the overlay to flicker and the UI to freeze.

## Decisions

**Decision 1: Single flag, two states for flush**

Set `needsFlushRef.current = true` when `processQueue` starts with a non-empty queue. In the `finally` block, if flag is set: schedule flush in setTimeout, reset flag. This is one flag, two states — no duplicate drain checks, no `uploadedCount` tracking.

**Decision 2: Use a simple useRef guard for runAutoGroup execution**

Rationale: `runAutoGroup` is idempotent — if it's already running, a second trigger will see the same result. We skip duplicate triggers entirely with an early return. A boolean ref is synchronous and prevents state races (unlike `useState` which is async).

Alternatives considered:
- Using `autoGrouping` state as guard: State updates are async in React; two triggers could both pass the check before either sets state to true. `useRef` is synchronous.
- Queue-based approach: Over-engineered; concurrent auto-group calls produce the same result, so skipping is sufficient.

## Risks / Trade-offs

[Risk] If `flushUngroupedPhotos` throws (caught inside setTimeout callback), the flag is already reset — acceptable since flush is idempotent.

[Risk] If the component unmounts while a flush is pending, the setTimeout still fires — acceptable since `flushUngroupedPhotos` handles missing state gracefully.

[Risk] If `runAutoGroup` is skipped while running, the trigger is silently dropped — acceptable since the running instance will produce the same result. The diagnostic log helps debug if this happens frequently.
