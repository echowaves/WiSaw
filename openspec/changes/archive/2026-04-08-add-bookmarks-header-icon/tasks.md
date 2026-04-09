## 1. Create BookmarksHeaderIcon Component

- [x] 1.1 Create `src/components/BookmarksHeaderIcon/index.js` following the `FriendsHeaderIcon` pattern: 40×40 TouchableOpacity, Ionicons `bookmark` at 22px, color from `STATE.bookmarksCount` (MAIN_COLOR if > 0, TEXT_SECONDARY otherwise), navigates to `bookmarks` on press

## 2. Add BookmarksHeaderIcon to PhotosListHeader

- [x] 2.1 Import `BookmarksHeaderIcon` in `src/screens/PhotosList/components/PhotosListHeader.js` and add it to the right-side icon group, before `FriendsHeaderIcon`, maintaining existing 8px gap
