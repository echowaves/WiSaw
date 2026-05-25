## 1. Fix post-upload grouping level

- [x] 1.1 In `src/screens/PhotosList/upload/photoUploadService.js`, change `flushUngroupedPhotos` to use `_groupingState.groupingLevel || 'CITY'` instead of hardcoded `'CITY'`

## 2. Update GroupingSettings info text

- [x] 2.1 In `src/screens/GroupingSettings/index.js`, replace the info card text `"Auto-group triggers when you move beyond the selected field-matching and local timestamps."` with `"Photos are grouped into waves by location and season. Each wave covers one season (e.g. Winter, Spring) at the selected grouping level."`

## 3. Wave name display normalization

- [x] 3.1 Create `src/utils/normalizeWaveName.js` with a function that converts old date-range wave names to season format using regex pattern matching for `"Mon D, YYYY"`, `"Mon YYYY"`, `"Mon – Mon YYYY"`, and `"Mon YYYY – Mon YYYY"` suffixes, with month-to-season mapping and Jan/Feb year adjustment for winter
- [x] 3.2 In `src/components/WaveCard/index.js`, import `normalizeWaveName` and apply it to `wave.name` in the display `<Text>` element
- [x] 3.3 Add unit tests in `src/utils/__tests__/normalizeWaveName.test.js` covering all date-range formats, season-format passthrough, user-created name passthrough, and winter year adjustment edge cases
