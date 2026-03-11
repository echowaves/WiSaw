## 1. GraphQL Mutation Update

- [x] 1.1 Update `autoGroupPhotos` in `src/screens/Waves/reducer.js` to use the new return shape: change the mutation's selection set from `{ wavesCreated, photosGrouped }` to `{ waveUuid, name, photosGrouped }`

## 2. Loop Handler Implementation

- [x] 2.1 Rewrite `handleAutoGroup` in `src/screens/Waves/index.js` to call `reducer.autoGroupPhotos` in a loop until `photosGrouped === 0`, tracking total waves created and total photos grouped
- [x] 2.2 Prepend each newly created wave (`{ waveUuid, name }`) to the waves list state incrementally during the loop
- [x] 2.3 After the loop completes, show a summary success toast with total waves created and total photos grouped, then call `handleRefresh`

## 3. Edge Cases and Error Handling

- [x] 3.1 Handle the "no ungrouped photos" case: when the first call returns `photosGrouped === 0`, show an info toast and skip the loop
- [x] 3.2 Handle mid-loop errors: stop the loop, show an error toast that includes how many waves were successfully created, and call `handleRefresh` to sync partial results
