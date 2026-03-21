## 1. Replace Dynamic Dispatch

- [x] 1.1 In `src/screens/PhotosList/reducer.js`, replace the array-index dispatch `[requestGeoPhotos, requestWatchedPhotos, requestSearchedPhotos][activeSegment]` with a `switch (activeSegment)` statement calling each function explicitly for cases 0, 1, 2

## 2. Verification

- [x] 2.1 Run Codacy CLI analysis on `src/screens/PhotosList/reducer.js` and confirm the `dangerous-non-static-data` finding is resolved
