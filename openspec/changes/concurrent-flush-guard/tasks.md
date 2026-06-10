## 1. Simplify flush logic with needsFlushRef in usePhotoUploader

- [x] 1.1 Add `needsFlushRef = useRef(false)` declaration alongside existing refs
- [x] 1.2 Set `needsFlushRef.current = queue.length > 0` at start of `processQueue` (before upload loop)
- [x] 1.3 Move flush scheduling to `finally` block: if flag on + grouping enabled, schedule flush, reset flag

## 2. Add autoGroupRunningRef guard to WavesHub runAutoGroup

- [x] 2.1 Add `autoGroupRunningRef = useRef(false)` declaration alongside existing refs
- [x] 2.2 Add guard check at start of `runAutoGroup` (skip if already running, log diagnostic message)
- [x] 2.3 Set `autoGroupRunningRef.current = true` before execution, reset to `false` in finally block

## 3. Verify correctness

- [x] 3.1 Confirm no other call sites in the codebase schedule `flushUngroupedPhotos` (ensure single point of scheduling)
