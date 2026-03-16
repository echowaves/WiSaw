## 1. Add Responsive Column Count to WavesHub

- [x] 1.1 Import `useWindowDimensions` from `react-native` in `src/screens/WavesHub/index.js`
- [x] 1.2 Compute `numColumns` based on screen width: `const numColumns = width >= 768 ? 2 : 1`
- [x] 1.3 Pass `numColumns={numColumns}` and `key={numColumns}` to the FlatList component
