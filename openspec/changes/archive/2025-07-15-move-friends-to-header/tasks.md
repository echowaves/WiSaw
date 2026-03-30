## 1. State Setup

- [x] 1.1 Add `friendsUnreadCount` atom (initialized to `null`) to `src/state.js`
- [x] 1.2 Update `PhotosList/index.js` to write the total unread count to the `friendsUnreadCount` atom during reload

## 2. FriendsHeaderIcon Component

- [x] 2.1 Create `src/components/FriendsHeaderIcon/index.js` — 40×40 touchable, `user-friends` icon, reads `friendsUnreadCount` atom, red dot badge when count > 0, navigates to `/friends`

## 3. Header Update

- [x] 3.1 Update `PhotosListHeader` to import `FriendsHeaderIcon`
- [x] 3.2 Convert the right-side container from a single absolute-positioned View to a flex row holding `WaveHeaderIcon` and `FriendsHeaderIcon` with 8px gap

## 4. Footer Simplification

- [x] 4.1 Remove the Friends button and Badge import from `PhotosListFooter`
- [x] 4.2 Remove `unreadCount` from the component's props interface
- [x] 4.3 Remove the `unreadCount` prop from all `PhotosListFooter` call sites in `PhotosList/index.js`

## 5. Verification

- [x] 5.1 Run lint check — no new errors
- [x] 5.2 Verify header renders both Waves and Friends icons side by side
- [x] 5.3 Verify footer renders 3 buttons without Friends
