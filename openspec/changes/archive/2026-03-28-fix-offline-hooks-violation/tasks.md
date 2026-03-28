## 1. Hoist Hooks Above Early Return

- [x] 1.1 Move the `useCallback(removePhoto)` and `useMemo(photosListContextValue)` declarations from after the `if (!netAvailable)` early return to immediately before it in `src/screens/PhotosList/index.js`
