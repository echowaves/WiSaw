## 1. Add loading prop to AppHeader

- [ ] 1.1 Add optional `loading` boolean prop to `AppHeaderProps` interface in `src/components/AppHeader/index.tsx`
- [ ] 1.2 Import `LinearProgress` and `CONST` in AppHeader; render a 3px indeterminate progress bar (matching PhotosListHeader pattern) at the bottom of the header when `loading` is true
- [ ] 1.3 Add `loading` prop to BookmarksList's existing `<AppHeader>` call in `src/screens/BookmarksList/index.js`

## 2. Move header into FriendDetail

- [ ] 2.1 Simplify route file `app/friendships/[friendUuid].tsx`: set `headerShown: false`, remove AppHeader import/render, remove theme/styles imports no longer needed
- [ ] 2.2 In `src/screens/FriendDetail/index.js`, import `AppHeader` and render it at the top of the component with `title` (friend name from route params), `onBack` (router.back), `rightSlot` (menu button), and `loading` prop
- [ ] 2.3 Remove the standalone `LinearProgress` bar from FriendDetail's JSX (replaced by AppHeader's built-in loading)

## 3. Move header into WaveDetail

- [ ] 3.1 Simplify route file `app/(drawer)/waves/[waveUuid].tsx`: set `headerShown: false`, remove AppHeader import/render, remove wave data fetch (`getWave`), frozen/role state, role config, and custom title construction
- [ ] 3.2 In `src/screens/WaveDetail/index.js`, import `AppHeader`; add wave data fetch with `useFocusEffect` for frozen/role state; build the custom title (snowflake icon + role badge) and render AppHeader with `title`, `onBack`, `rightSlot` (menu button), and `loading` prop
- [ ] 3.3 Remove the standalone `LinearProgress` bar from WaveDetail's JSX (replaced by AppHeader's built-in loading)

## 4. Verify

- [ ] 4.1 Confirm all three screens (BookmarksList, FriendDetail, WaveDetail) show the progress bar during loading and hide it when loading completes
- [ ] 4.2 Confirm route files `[friendUuid].tsx` and `[waveUuid].tsx` no longer import or render AppHeader
