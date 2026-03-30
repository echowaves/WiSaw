## 1. Add Location Guard

- [x] 1.1 Add `if (!location) return` early return at the top of the `reload` callback in `src/screens/PhotosList/index.js`, before any side effects (pending queue, friends refresh, feedReload).

## 2. Verify

- [x] 2.1 Launch the app and confirm no crash on startup — the geo-feed loads once location permission resolves.
- [x] 2.2 Confirm that toggling network off/on while location is available still triggers a reload correctly.
