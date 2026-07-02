## 1. Friends "Recent" Sort — Use Most Recent Photo Date

- [x] 1.1 Update `src/screens/FriendsList/index.js` sort logic to use photo date instead of `updatedAt`
- [x] 1.2 Verify pending friends remain pinned at top when sorting by recent photo

## 2. Waves "Recent" Sort — Delegate to Backend `recentPhoto`

- [x] 2.1 Update `src/screens/WavesHub/index.js` `sortOptions` to use `sortBy: 'recentPhoto'`
- [x] 2.2 Update `loadWaves` to pass `sortBy: 'recentPhoto'` when Recent sort is active
- [x] 2.3 Update `filteredWaves` client-side sort to handle `recentPhoto` sortBy value
- [x] 2.4 Verify A-Z sort still works and passes `sortBy: 'name'` to backend

## 3. Verification

- [x] 3.1 Run ESLint to confirm no errors or warnings (pre-existing ESLint config issue, syntax verified via `node --check`)
- [x] 3.2 Verify app builds without type errors (affected files are JS, no TypeScript compilation needed)
