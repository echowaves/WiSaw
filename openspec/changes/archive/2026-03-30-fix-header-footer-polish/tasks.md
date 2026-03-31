## 1. Header icon order

- [x] 1.1 Swap FriendsHeaderIcon and WaveHeaderIcon order in PhotosListHeader right-side row

## 2. Friends icon coloring

- [x] 2.1 Add `STATE.friendsList` atom read to FriendsHeaderIcon
- [x] 2.2 Update icon color logic: `MAIN_COLOR` when `friendsList.length > 0`, `TEXT_SECONDARY` when empty
- [x] 2.3 Keep badge logic tied to `friendsUnreadCount > 0` (unchanged)

## 3. Footer centering

- [x] 3.1 Absolutely position the menu button on the left side of the footer (`left: 20`)
- [x] 3.2 Change footer inner layout from `space-around` to `center` with `gap: 24` for the video + camera buttons

## 4. Verification

- [x] 4.1 Run lint check and confirm no new errors
