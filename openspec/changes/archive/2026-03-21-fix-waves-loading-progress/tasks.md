## 1. Add LinearProgress to WavesHub

- [x] 1.1 In `src/screens/WavesHub/index.js`, import `LinearProgress` from `../../components/ui/LinearProgress` and add the progress bar JSX (3px, `CONST.MAIN_COLOR`, `theme.HEADER_BACKGROUND`) shown when `loading` is true, positioned between the search bar and the FlatList

## 2. Delete Dead Waves Component

- [x] 2.1 Delete `src/screens/Waves/index.js` (dead code — no route renders it; reducer.js is kept)

## 3. Verification

- [x] 3.1 Run Codacy CLI analysis on modified files
