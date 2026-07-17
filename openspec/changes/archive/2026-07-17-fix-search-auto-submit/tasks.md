## 1. Fix search auto-submit bug

- [x] 1.1 Remove `searchTerm` from the `useEffect` dependency array in `src/screens/PhotosList/index.js` (line ~309) so the feed only reloads when `isBookmarksMode` changes, not on every keystroke
- [x] 1.2 Verify that pressing the send button (FAB icon) still submits the search correctly via `submitSearch` → `onSearch` → `reload`
- [x] 1.3 Verify that toggling the feed mode (global ↔ starred/bookmarks) still reloads with the current search term preserved
