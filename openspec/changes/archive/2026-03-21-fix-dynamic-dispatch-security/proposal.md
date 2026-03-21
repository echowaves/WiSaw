## Why

Codacy/Opengrep flags a security pattern in `src/screens/PhotosList/reducer.js` line 283: dynamic array-index dispatch (`[fn1, fn2, fn3][activeSegment]`) is flagged as dangerous because non-static data is used to select and execute a function. While `activeSegment` is internal state (not user-controlled), the pattern is a known code smell that static analysis tools rightfully flag. Replacing it with a deterministic switch statement eliminates the warning and makes the dispatch logic explicit.

## What Changes

- **Replace dynamic array-index dispatch with a switch statement** in `getPhotos()` inside `src/screens/PhotosList/reducer.js`: instead of `[requestGeoPhotos, requestWatchedPhotos, requestSearchedPhotos][activeSegment]`, use a `switch (activeSegment)` that calls each function explicitly

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

_(none — this is a pure implementation-detail refactor with no behavior change)_

## Impact

- **Code**: Single file change in `src/screens/PhotosList/reducer.js`, function `getPhotos()`
- **Behavior**: No functional change — same functions called for the same segment values
- **Codacy**: Resolves the Opengrep `dangerous-non-static-data` pattern finding
