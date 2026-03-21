## 1. WaveDetail Loading Progress Bar

- [x] 1.1 In `src/screens/WaveDetail/index.js`, import `LinearProgress` from `../../components/ui/LinearProgress` and add the `LinearProgress` bar JSX (matching PhotosList: 3px height, `CONST.MAIN_COLOR`, `theme.HEADER_BACKGROUND` track) shown when `loading` is true, positioned between the header area and the masonry content
- [x] 1.2 In `src/screens/WaveDetail/index.js`, remove the centered `ActivityIndicator` that shows when `loading && photos.length === 0`

## 2. Waves List Loading Progress Bar

- [x] 2.1 In `src/screens/Waves/index.js`, import `LinearProgress` from `../../components/ui/LinearProgress` and add the `LinearProgress` bar JSX (matching PhotosList pattern) shown when `loading` is true, positioned between the header area and the FlatList

## 3. Verification

- [x] 3.1 Run Codacy CLI analysis on both modified files
