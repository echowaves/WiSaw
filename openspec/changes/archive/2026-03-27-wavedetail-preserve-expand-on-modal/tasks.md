## 1. Replace useFocusEffect with useEffect in WaveDetail

- [x] 1.1 Convert the `useFocusEffect(useCallback(..., [waveUuid]))` block to a `useEffect(() => { ... }, [waveUuid])` that performs the same initial load logic (reset pagination, clear expanded photos, generate batch, load photos)
- [x] 1.2 Remove the `useFocusEffect` import from `expo-router` if no other usage remains in WaveDetail
