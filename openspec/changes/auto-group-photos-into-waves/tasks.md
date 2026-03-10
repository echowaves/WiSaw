## 1. GraphQL Integration

- [ ] 1.1 Add `autoGroupPhotosIntoWaves` mutation to `src/screens/Waves/reducer.js` with `AUTO_GROUP_PHOTOS_MUTATION` GraphQL template and an `autoGroupPhotos({ uuid })` async function that calls the mutation and returns `{ wavesCreated, photosGrouped }`

## 2. Waves Screen UI

- [ ] 2.1 Add auto-grouping state variables to Waves screen (`autoGrouping` loading flag)
- [ ] 2.2 Add `handleAutoGroup` callback that shows a confirmation Alert, calls `reducer.autoGroupPhotos`, displays a success/info Toast with results, and triggers a wave list refresh
- [ ] 2.3 Add "Auto-Group" button (FontAwesome5 `layer-group` icon) next to the existing create wave button, disabled during `autoGrouping` state
- [ ] 2.4 Handle edge case where `wavesCreated === 0` by showing an informational toast ("No ungrouped photos found")
- [ ] 2.5 Handle mutation errors by showing an error toast and keeping the waves list unchanged

## 3. Verification

- [ ] 3.1 Verify the auto-group button renders correctly in both light and dark themes
- [ ] 3.2 Test the full flow: tap Auto-Group → confirm → mutation fires → toast shows results → wave list refreshes
