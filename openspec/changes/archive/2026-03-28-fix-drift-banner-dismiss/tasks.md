## 1. Fix Drift Banner Dismiss

- [x] 1.1 Add `const [feedLocationVersion, setFeedLocationVersion] = useState(0)` to PhotosList component in `src/screens/PhotosList/index.js`
- [x] 1.2 In the `reload()` function, add `setFeedLocationVersion(v => v + 1)` immediately after the `feedLocationRef.current = locationState.coords` snapshot
- [x] 1.3 Add `feedLocationVersion` to the `showDriftBanner` useMemo dependency array
