# Tasks: Fix Waves Screen Freeze

## 1. Make handleRefresh Async and Await Operations

- [x] 1.1 Change `handleRefresh` callback to `async`
- [x] 1.2 Wrap `loadWaves` and `fetchCounts` calls in `Promise.all()` with `await`

**Files**: `src/screens/WavesHub/index.js`

**Acceptance**:
- Both `loadWaves` and `fetchCounts` complete before `handleRefresh` returns
- No race condition between waves list and count updates

---

## 2. Add Refresh Guard to Prevent Concurrent Calls

- [x] 2.1 Add `refreshRunningRef = useRef(false)` alongside existing refs
- [x] 2.2 Add guard check at start of `handleRefresh`: `if (refreshRunningRef.current) return`
- [x] 2.3 Set `refreshRunningRef.current = true` after guard passes
- [x] 2.4 Wrap rest of implementation in try/finally to reset ref

**Files**: `src/screens/WavesHub/index.js`

**Acceptance**:
- Only one `handleRefresh` can run at a time
- Subsequent calls while running are skipped
- Ref resets after completion

---

## 3. Remove Double Refresh After Auto-Group

- [x] 3.1 Remove direct `handleRefresh()` call from `runAutoGroup` function
- [x] 3.2 Verify `subscribeToAutoGroupDone` listener still triggers `handleRefresh`

**Files**: `src/screens/WavesHub/index.js`

**Acceptance**:
- Only ONE refresh after auto-group completes
- No redundant GraphQL queries

---

## 4. Verification

- [ ] 4.1 Take 3 photos, wait for upload, trigger auto-group, navigate to Waves - verify no freeze
- [ ] 4.2 Take multiple batches of photos rapidly, verify no freeze on navigation
- [ ] 4.3 Navigate to Waves, back, to Waves again rapidly - verify no freeze or duplicate requests
- [x] 4.4 Run Codacy CLI on modified files
- [x] 4.5 Verify no TypeScript errors (if applicable)

**Testing scenarios**:
1. **Auto-group completion**: Take photos, trigger auto-group, navigate to Waves - should load without freeze
2. **Rapid uploads**: Take 3 photos, wait for upload, take 1 more - verify badge updates correctly
3. **Rapid navigation**: Navigate to Waves repeatedly - verify no freeze or duplicate requests

---

## Files Modified Summary

| File | Changes | Lines |
|------|---------|-------|
| `src/screens/WavesHub/index.js` | Make handleRefresh async, add guard, remove double refresh | ~15 |

**Total**: ~15 lines changed

---

## Implementation Notes

- **Task 4.1-4.3**: Manual testing scenarios documented but not executed in this session
- **Task 4.4**: Codacy CLI passed with no issues
- **Task 4.5**: Not applicable (JavaScript file, no TypeScript)

---

## Estimated Complexity

- **Task 1**: 2 points (make handleRefresh async)
- **Task 2**: 1 point (add guard)
- **Task 3**: 1 point (remove double refresh)
- **Task 4**: 1 point (testing)
- **Total**: 5 points
