## 1. FriendsList Header Ownership

- [x] 1.1 Add AppHeader import and render AppHeader with `title`, `onBack`, `rightSlot` (add-friend + sort menu buttons), and `loading={loading}` at the top of FriendsList component
- [x] 1.2 Move sort menu items array and add-friend button JSX from `app/(drawer)/friends.tsx` into FriendsList
- [x] 1.3 Remove standalone LinearProgress bar from FriendsList screen body
- [x] 1.4 Simplify `app/(drawer)/friends.tsx` to `headerShown: false` + `<FriendsList />`

## 2. WavesHub Header Ownership

- [x] 2.1 Add AppHeader import and render AppHeader with `title`, `onBack`, `rightSlot` (dots-vertical button with ungrouped badge), and `loading={loading}` at the top of WavesHub component
- [x] 2.2 Move sort/action menu items array and ActionMenu from `app/(drawer)/waves/index.tsx` into WavesHub
- [x] 2.3 Remove standalone LinearProgress bar from WavesHub screen body
- [x] 2.4 Simplify `app/(drawer)/waves/index.tsx` to `headerShown: false` + `<WavesHub />`

## 3. Verification

- [x] 3.1 Verify FriendsList shows loading progress in AppHeader during initial load and pull-to-refresh
- [x] 3.2 Verify WavesHub shows loading progress in AppHeader during initial load and pull-to-refresh
