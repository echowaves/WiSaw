## 1. Remove orphaned animation effect

- [ ] 1.1 Delete the `useEffect` block in `src/screens/WaveDetail/index.js` (lines ~173–201) that references undeclared `pendingPhotosAnimation` and `uploadIconAnimation`, including the entire `// Pending photos animation` comment
- [ ] 1.2 Verify no remaining references to `pendingPhotosAnimation` or `uploadIconAnimation` exist in the file
- [ ] 1.3 Verify `Animated` import from `react-native` is still needed by other code in the file; remove it if orphaned
