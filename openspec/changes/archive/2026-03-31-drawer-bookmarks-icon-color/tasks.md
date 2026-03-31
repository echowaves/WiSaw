## 1. Add bookmarksCount atom and reducer

- [x] 1.1 Add `bookmarksCount` atom to `src/state.js` initialized to `null`
- [x] 1.2 Add `getBookmarksCount` async function to `src/screens/Waves/reducer.js` calling the `getWatchedCount` GraphQL query (following the `getWavesCount` pattern)

## 2. Fetch bookmarksCount in WaveHeaderIcon

- [x] 2.1 Import `getBookmarksCount` in `src/components/WaveHeaderIcon/index.js`
- [x] 2.2 Add `bookmarksCount`/`setBookmarksCount` atom hook to `WaveHeaderIcon`
- [x] 2.3 Add `getBookmarksCount({ uuid })` to the existing `Promise.all` and write the result to `setBookmarksCount`

## 3. Create BookmarksDrawerIcon and wire up

- [x] 3.1 In `app/(drawer)/_layout.tsx`, create a `BookmarksDrawerIcon` inline component that reads `STATE.bookmarksCount`, uses `MAIN_COLOR` when `count > 0 && !focused`, otherwise uses the drawer `color` prop
- [x] 3.2 Update the Bookmarks `Drawer.Screen` to use `(props) => <BookmarksDrawerIcon {...props} />` as its `drawerIcon`

## 4. Verify

- [x] 4.1 Confirm bookmarks count is fetched alongside waves/ungrouped counts on header mount
- [x] 4.2 Confirm Bookmarks drawer icon shows `MAIN_COLOR` when user has bookmarks and item is inactive
- [x] 4.3 Confirm Bookmarks drawer icon falls back to default drawer color when focused/active or count is 0
