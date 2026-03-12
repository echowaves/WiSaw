## 1. GraphQL Selection Set Update

- [x] 1.1 Update `autoGroupPhotos` mutation in `src/screens/Waves/reducer.js` to add `photosRemaining` and `hasMore` to the selection set

## 2. Loop Logic Update

- [x] 2.1 Replace the `while (true)` loop in `handleAutoGroup` (`src/screens/Waves/index.js`) with a `do...while(result.hasMore)` loop, removing the `eslint-disable` comment
- [x] 2.2 Update the "no ungrouped photos" check to use `totalWavesCreated === 0` after the loop ends (when first call has `hasMore: false` and `photosGrouped: 0`)
