## Context

The `getPhotos()` function in `src/screens/PhotosList/reducer.js` uses an array-index pattern to dispatch to one of three request functions based on the `activeSegment` value (0 = geo, 1 = watched, 2 = searched). Opengrep flags this as a security concern because non-static data drives function selection. While `activeSegment` is internal React state (set via `useState(0)` in PhotosList), the pattern is inherently fragile and tools cannot verify the data is trustworthy.

## Goals / Non-Goals

**Goals:**
- Eliminate the Codacy/Opengrep security finding by replacing dynamic dispatch with a static switch statement
- Preserve identical runtime behavior

**Non-Goals:**
- Refactoring `getPhotos()` beyond the dispatch mechanism
- Changing how `activeSegment` is managed or validated upstream

## Decisions

### Replace array-index dispatch with switch statement

**Before:**
```js
const requestFn = [requestGeoPhotos, requestWatchedPhotos, requestSearchedPhotos][activeSegment]
if (requestFn) {
  return await requestFn(requestParams)
}
```

**After:**
```js
switch (activeSegment) {
  case 0:
    return await requestGeoPhotos(requestParams)
  case 1:
    return await requestWatchedPhotos(requestParams)
  case 2:
    return await requestSearchedPhotos(requestParams)
  default:
    break
}
```

**Rationale:** A switch statement makes all call targets statically visible, satisfying the Opengrep rule. The default fallthrough to the existing error-return at the end of the function preserves current behavior for unexpected values.

## Risks / Trade-offs

- **[Risk] Behavioral divergence**: None — the switch maps the same indices to the same functions. The default case falls through to the existing return of `{ photos: [], batch, noMoreData: true }`, matching what happened when `requestFn` was `undefined`.
