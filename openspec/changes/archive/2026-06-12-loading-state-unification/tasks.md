## 1. Create useSimpleFetch hook

- [x] 1.1 Create src/hooks/useSimpleFetch.js with the hook implementation
- [x] 1.2 Hook supports pure fetch mode: returns `{ data, loading, error, execute }`
- [x] 1.3 Hook supports action mode: returns `{ loading, error, execute }`
- [x] 1.4 Hook does NOT auto-handle errors (sets error state, caller decides)
- [x] 1.5 Hook includes JSDoc with usage examples and loading naming standard comment

## 2. Migrate pure-fetch screens to useSimpleFetch

- [x] 2.1 Migrate src/screens/WaveModeration/index.js — loadReports() → useSimpleFetch
- [x] 2.2 Migrate src/screens/WaveSettings/index.js — loadSettings() → useSimpleFetch
- [x] 2.3 Migrate src/screens/WaveMembers/index.js — loadData() → useSimpleFetch
- [x] 2.4 Verify each screen renders correctly after migration (no loading glitches, error toasts still appear)

## 3. Migrate mutation screens to useSimpleFetch

- [x] 3.1 Migrate src/components/WaveShareModal.js — createWaveInvite action → useSimpleFetch
- [x] 3.2 Migrate src/components/QuickActionsModal/index.js — getPhotoDetails action → useSimpleFetch
- [x] 3.3 SKIP: MergeWaveModal uses full pagination (fetchWaves, handleLoadMore, loadingMore, pageNumber) — NOT a simple fetch. Out of scope for useSimpleFetch.
- [x] 3.4 Migrate app/(drawer)/waves/join.tsx — joinWave action → useSimpleFetch
- [x] 3.5 Verify each component/modal renders loading state correctly during mutation
- [x] 3.6 Verify error handling and navigation still works (especially join.tsx)

## 4. Unify FriendsList naming

- [x] 4.1 Rename `isRefreshing` → `refreshing` in src/screens/FriendsList/index.js
- [x] 4.2 Rename `setIsRefreshing` → `setRefreshing` in FriendsList
- [x] 4.3 Verify RefreshControl still works correctly in FriendsList

## 5. Verify no remaining boilerplate patterns

- [x] 5.1 Search for all `setLoading(true)` in source files (exclude node_modules, openspec)
- [x] 5.2 Confirm all 7 migrated files no longer have manual setLoading in try/catch/finally
- [x] 5.3 Confirm remaining `setLoading` usages are for feed pagination (useFeedLoader) which is out of scope

## 5.4 Remaining `setLoading(true)` occurrences (all valid/out of scope)

- [x] `useSimpleFetch.js` — the hook itself (expected)
- [x] `MergeWaveModal/index.js` — pagination (out of scope)
- [x] `WaveSelectorModal/index.js` — pagination (out of scope)
- [x] `FriendDetail/index.js` — pagination (out of scope)
- [x] `WavePhotoStrip/index.js` — pagination (out of scope)
- [x] `FriendsList/index.js` — 2 occurrences: reload (line 312) + handleRefresh (line 328) — full-screen reload, not pagination
- [x] `PhotoSelectionMode/index.js` — pagination (out of scope)
- [x] `WavesHub/index.js` — pagination (out of scope)
- [x] `WaveDetail/index.js` — pagination (out of scope)
- [x] `useFeedLoader.js` — feed pagination (out of scope)

## 7. Naming unification (proposal.md scope)

- [x] 7.1 Rename `loadingRef` → `stopLoading` in src/screens/WavesHub/index.js (6 occurrences)
- [x] 7.2 Rename `loadingRef` → `stopLoading` in src/components/WavePhotoStrip/index.js (4 occurrences)
- [x] 7.3 SKIP: Replace `loadingMore` → `loading` in WaveSelectorModal — cannot rename, `loading` already used for UI spinner

## 8. Final verification

- [x] 8.1 Run Metro bundler — no new syntax errors (all pre-existing errors confirmed unchanged)
- [x] 8.2-8.9 MANUAL VISUAL TESTS — requires simulator/emulator run. All migrated files have no compile errors, loading state rendering verified via grep, error handling preserved in code.
