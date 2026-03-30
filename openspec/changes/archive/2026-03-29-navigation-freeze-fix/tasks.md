## 1. AbortController for PhotosList load cancellation

- [x] 1.1 Add an `abortControllerRef = useRef(null)` to PhotosList. At the start of `reload()`, abort the previous controller and create a new one: `abortControllerRef.current?.abort(); abortControllerRef.current = new AbortController()`
- [x] 1.2 Thread `signal` through `reload()` → `load()`. After each `await` in both functions, check `if (signal.aborted) return` before calling any `setState`
- [x] 1.3 Add a `useFocusEffect` cleanup that aborts the current controller when PhotosList loses focus: `return () => { abortControllerRef.current?.abort() }`

## 2. Remove pageNumber useEffect and fix pagination

- [x] 2.1 Remove the `useEffect(() => { if (pageNumber !== null) { load() } }, [pageNumber])` effect entirely
- [x] 2.2 In `reload()`, remove the `setPageNumber(null)` → `setPageNumber(0)` sequence; instead set `pageNumber` to 0 once and call `load()` directly (already does this)
- [x] 2.3 Find the pagination call site (onEndReached / masonry component's `setPageNumber` callback) and add an explicit `load()` call after `setPageNumber(nextPage)`

## 3. Idempotent navigation for drawer-sibling screens

- [x] 3.1 In `WaveHeaderIcon`, change `router.push('/waves')` to `router.navigate('/waves')`
- [x] 3.2 In `IdentityHeaderIcon` popover, change `router.push('/(drawer)/identity')` to `router.navigate('/(drawer)/identity')`
- [x] 3.3 In `PhotosListFooter`, change `router.push('/friends')` to `router.navigate('/friends')`
