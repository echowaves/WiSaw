## 1. PhotosListEmptyState — pull-to-refresh and label fix

- [ ] 1.1 Add `refreshing`, `onRefresh`, and `onCameraPress` props to `PhotosListEmptyState`
- [ ] 1.2 Add `RefreshControl` (from `react-native`) to the `ScrollView` in `PhotosListEmptyState`, wired to `onRefresh` and `refreshing`
- [ ] 1.3 Change the `actionText` for `case 0` (global photos) from `"Take a Photo"` to `"Refresh"`
- [ ] 1.4 Change the `onActionPress` for `case 0` to call `reload()` (already does — confirm no change needed)
- [ ] 1.5 Add `secondaryActionText: "Take a Photo"` and `onSecondaryActionPress: onCameraPress` for `case 0` in the `getEmptyStateProps` switch

## 2. PhotosList index — thread new props down

- [ ] 2.1 Pass `refreshing={loading}` to `PhotosListEmptyState` from `PhotosList/index.js`
- [ ] 2.2 Pass `onRefresh={reload}` to `PhotosListEmptyState`
- [ ] 2.3 Pass `onCameraPress={checkPermissionsForPhotoTaking}` to `PhotosListEmptyState`

## 3. FriendDetail — wrap empty state in refreshable ScrollView

- [ ] 3.1 In `FriendDetail/index.js`, when `photos.length === 0 && !loading`, wrap the `EmptyStateCard` in a `ScrollView` with `RefreshControl` wired to `handleRefresh` and `refreshing={loading}`
- [ ] 3.2 Add `actionText="Refresh"` and `onActionPress={handleRefresh}` to the `EmptyStateCard` in the friend detail empty state branch

## 4. BookmarksList — verify and add non-offline empty state

- [ ] 4.1 Audit `BookmarksList/index.js` for any code path where `photosList.length === 0` and `stopLoading` is true but is not the offline state — confirm whether an empty state is rendered
- [ ] 4.2 If missing, add an empty state card (icon `bookmark`, title "No Bookmarks Yet") inside a `ScrollView` with `RefreshControl` wired to `reload`

## 5. Verification

- [ ] 5.1 Manually test: global photos empty state — pull-to-refresh triggers reload, "Refresh" button reloads, "Take a Photo" button opens camera
- [ ] 5.2 Manually test: friend detail with a friend who has no photos — pull-to-refresh works, "Refresh" button visible
- [ ] 5.3 Manually test: no regression on non-empty states (photos lists still scroll/load-more normally)
