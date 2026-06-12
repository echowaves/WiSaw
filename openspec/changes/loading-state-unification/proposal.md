## Why

Loading state management is fragmented across 7+ screens with duplicated boilerplate patterns and inconsistent naming. Three pure-fetch screens (WaveModeration, WaveSettings, WaveMembers) each repeat a 15-line `setLoading` try/catch/finally block. Four mutation handlers (WaveShareModal, QuickActionsModal, join.tsx, and one more) repeat a similar `setLoading` guard around async actions. Meanwhile, the same concepts (`refreshing` vs `isRefreshing`, `loadingRef` vs `stopLoading`) use different variable names across files, making the codebase harder to read and maintain. Note: MergeWaveModal uses full pagination logic and is out of scope for this change.

## What Changes

- Extract `useSimpleFetch` hook covering 6 screens (3 pure-fetch + 3 mutation handlers)
- Rename `isRefreshing` → `refreshing` in FriendsList to match the standard
- Rename `loadingRef` → `stopLoading` (or unify the guard mechanism) in WavesHub and WavePhotoStrip
- Replace `loadingMore` in WaveSelectorModal with `loading` (converge to WavesHub's single-`loading` approach for consistency)
- Document the loading state naming standard for future screens

## Capabilities

### New Capabilities

- `use-simple-fetch`: Custom React hook that encapsulates loading state management for simple single-fetch operations and action handlers

### Modified Capabilities

- `empty-state-refresh`: Minor — `FriendsList` refreshing prop name changes from `isRefreshing` to `refreshing` to match spec vocabulary

## Impact

- **Modified files:** WaveModeration/index.js, WaveSettings/index.js, WaveMembers/index.js, WaveShareModal.js, QuickActionsModal/index.js, join.tsx, FriendsList/index.js
- **New files:** src/hooks/useSimpleFetch.js
- **Behavior:** No user-facing changes. All changes are internal refactoring.
- **Risk:** Low — each screen can be migrated independently and verified visually
