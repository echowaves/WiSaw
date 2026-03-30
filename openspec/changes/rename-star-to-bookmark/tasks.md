## 1. Rename Screen Files and Components

- [x] 1.1 Rename directory `src/screens/StarredList/` to `src/screens/BookmarksList/` and rename the component inside from `StarredList` to `BookmarksList`. Update all internal references: header title to "Bookmarks", empty state text from "Starred" to "Bookmarks"/"bookmark", offline message to "Bookmarked content requires an internet connection.", empty state icon from `'star'` to `'bookmark'`, and export name.
- [x] 1.2 Rename `app/(drawer)/starred.tsx` to `app/(drawer)/bookmarks.tsx`. Update the import from `StarredList` to `BookmarksList` and rename the function from `StarredScreen` to `BookmarksScreen`.
- [x] 1.3 Update `app/(drawer)/_layout.tsx`: change Drawer.Screen `name='starred'` to `name='bookmarks'`, label to `'Bookmarks'`, icon from `AntDesign 'star'` to `Ionicons 'bookmark'`, and update the icon import (add `Ionicons` if not present, remove `AntDesign` if no longer used).

## 2. Rename PhotoActionButtons Variables and Icons

- [x] 2.1 In `src/components/PhotoActionButtons/index.js`: rename `isStarred` → `isBookmarked`, `isStarStatusUnknown` → `isBookmarkStatusUnknown`, `starAccentColor` → `bookmarkAccentColor`, `isBannedOrStarred` → `isBannedOrBookmarked`. Change Bookmark button icon from `Ionicons 'star'`/`'star-outline'` to `'bookmark'`/`'bookmark-outline'`.
- [x] 2.2 In `src/components/PhotoActionButtons/index.js`: remove text labels (`<Text>` elements) from the Report, Delete, Bookmark, and Share buttons. Keep the Wave button text label intact.
- [x] 2.3 In `src/components/PhotoActionButtons/index.js`: update toast messages from "Unable to Report Starred photo" → "Can't report bookmarked photo", "Un-Star photo first" → "Remove bookmark first", "Unable to delete Starred photo" → "Can't delete bookmarked photo".

## 3. Update Photo Stats Display

- [x] 3.1 In `src/components/Photo/index.js`: change the watcher stats icon from `AntDesign 'star'` to `Ionicons 'bookmark'` and remove the "Star(s)" text label — show only icon + count.

## 4. Update Toast Messages in Reducer and Hook

- [x] 4.1 In `src/components/Photo/reducer.js`: update toast `text1` from "Unable to Star photo" → "Unable to bookmark photo" and "Unable to un-Star photo" → "Unable to remove bookmark".
- [x] 4.2 In `src/hooks/usePhotoActions.js`: update toast messages from "Unable to delete Starred photo" → "Can't delete bookmarked photo", "Un-Star photo first" → "Remove bookmark first", "Unable to Report Starred photo" → "Can't report bookmarked photo".

## 5. Verify

- [x] 5.1 Run the app, open the drawer, and confirm "Bookmarks" appears with a bookmark icon between Identity and Friends.
- [x] 5.2 Open a photo, confirm the action buttons show icon-only (no text) for Report, Delete, Bookmark, and Share. Confirm the Wave button still shows its text label.
- [x] 5.3 Confirm the bookmark icon toggles between outline/filled with gold color when tapped.
