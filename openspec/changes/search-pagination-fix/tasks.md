## 1. Auto-page search results in useFeedLoader

- [x] 1.1 In `src/screens/PhotosList/hooks/useFeedLoader.js`, extend the non-empty response branch in `load()`: when `effectiveSearchTerm.length > 0 && !noMoreData && nextPage != null`, recursively call `load(fetchParams, effectiveSearchTerm, signal, nextPage)` after appending photos — mirroring the existing empty-response auto-page pattern

## 2. Cleanup

- [x] 2.1 Remove debug console.log statements added during investigation from `useFeedLoader.js` and `PhotosListMasonry.js`
