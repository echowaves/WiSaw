## 1. Fix PhotosListMasonry onEndReached Delegation

- [x] 1.1 In `src/screens/PhotosList/components/PhotosListMasonry.js`, modify the `onEndReached` handler to call the `onEndReached` prop when provided, falling back to the existing `setPageNumber` logic when the prop is not provided

## 2. Verification

- [x] 2.1 Verify WaveDetail pagination: confirm `handleLoadMore` is called when scrolling to the bottom and new photos are fetched
- [x] 2.2 Verify PhotosList (main feed) pagination still works correctly with the fallback `setPageNumber` path
- [x] 2.3 Verify PhotoSelectionMode pagination still works correctly
