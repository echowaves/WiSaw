## 1. Add search term ref

- [x] 1.1 Add `searchTermRef` (useRef) initialized to `''` in useFeedLoader
- [x] 1.2 In `reload()`, write `searchTermOverride` to `searchTermRef.current` (use `searchTermOverride ?? ''`)

## 2. Fix handleLoadMore

- [x] 2.1 Update `handleLoadMore()` to pass `searchTermRef.current` as `searchTermOverride` instead of `null`

## 3. Verification

- [x] 3.1 Check for lint errors in useFeedLoader.js (ESLint config broken pre-existing — not related to change)
