## 1. PhotosListEmptyState — pull-to-refresh and label fix

- [x] 1.1 Add `refreshing`, `onRefresh`, and `onCameraPress` props to `PhotosListEmptyState`
- [x] 1.2 Add `RefreshControl` (from `react-native`) to the `ScrollView` in `PhotosListEmptyState`, wired to `onRefresh` and `refreshing`
- [x] 1.3 Change the `actionText` for `case 0` (global photos) from `"Take a Photo"` to `"Refresh"`
- [x] 1.4 Change the `onActionPress` for `case 0` to call `reload()` (already does — confirm no change needed)
- [x] 1.5 Add `secondaryActionText: "Take a Photo"` and `onSecondaryActionPress: onCameraPress` for `case 0` in the `getEmptyStateProps` switch

## 2. PhotosList index — thread new props down

- [x] 2.1 Pass `refreshing={loading}` to `PhotosListEmptyState` from `PhotosList/index.js`
- [x] 2.2 Pass `onRefresh={reload}` to `PhotosListEmptyState`
- [x] 2.3 Pass `onCameraPress={checkPermissionsForPhotoTaking}` to `PhotosListEmptyState`

## 3. FriendDetail — wrap empty state in refreshable ScrollView

- [x] 3.1 In `FriendDetail/index.js`, when `photos.length === 0 && !loading`, wrap the `EmptyStateCard` in a `ScrollView` with `RefreshControl` wired to `handleRefresh` and `refreshing={loading}`
- [x] 3.2 Add `actionText="Refresh"` and `onActionPress={handleRefresh}` to the `EmptyStateCard` in the friend detail empty state branch

## 4. BookmarksList — verify and add non-offline empty state

- [x] 4.1 Audit `BookmarksList/index.js` for any code path where `photosList.length === 0` and `stopLoading` is true but is not the offline state — confirm whether an empty state is rendered
- [x] 4.2 If missing, add an empty state card (icon `bookmark`, title "No Bookmarks Yet") inside a `ScrollView` with `RefreshControl` wired to `reload`

## 5. Verification

- [x] 5.1 Manually test: global photos empty state — pull-to-refresh triggers reload, "Refresh" button reloads, "Take a Photo" button opens camera
- [x] 5.2 Manually test: friend detail with a friend who has no photos — pull-to-refresh works, "Refresh" button visible
- [x] 5.3 Manually test: no regression on non-empty states (photos lists still scroll/load-more normally)

<!-- Note: Tasks 1.1-2.3 were implemented directly in PhotosList/index.js (inline empty state),
     not in PhotosListEmptyState.js (which is unused dead code). -->
