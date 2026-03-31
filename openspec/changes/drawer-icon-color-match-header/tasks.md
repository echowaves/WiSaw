## 1. Create FriendsDrawerIcon component

- [x] 1.1 In `app/(drawer)/_layout.tsx`, create a `FriendsDrawerIcon` inline component that reads `STATE.friendsList`, computes `hasFriends`, and applies `MAIN_COLOR` when `hasFriends && !focused`, otherwise uses the drawer `color` prop
- [x] 1.2 Update the Friends `Drawer.Screen` to use `(props) => <FriendsDrawerIcon {...props} />` as its `drawerIcon`

## 2. Update WavesDrawerIcon color logic

- [x] 2.1 In `WavesDrawerIcon`, add `focused` to the destructured props and read `STATE.wavesCount` atom
- [x] 2.2 Compute `hasActivity = (wavesCount > 0) || (ungroupedCount > 0)` and apply `MAIN_COLOR` when `hasActivity && !focused`, otherwise use the drawer `color` prop

## 3. Verify

- [x] 3.1 Confirm Friends drawer icon shows `MAIN_COLOR` when user has friends and item is inactive
- [x] 3.2 Confirm Waves drawer icon shows `MAIN_COLOR` when wave activity exists and item is inactive
- [x] 3.3 Confirm both icons fall back to default drawer color when focused/active
