## 1. Remove Identity Badge

- [x] 1.1 Remove the identity badge conditional block (nickname display + "Set up identity" touchable) from `CustomDrawerContent` in `app/(drawer)/_layout.tsx`
- [x] 1.2 Remove unused styles from `createStyles`: `identityBadge`, `identityIconContainer`, `identityNickName`, `identityStatus`, `identitySetupText`
- [x] 1.3 Remove the `nickName` atom read and `router` import from `CustomDrawerContent` if no longer used there

## 2. Enhance Identity Drawer Item

- [x] 2.1 Create `IdentityDrawerIcon` component inline in `_layout.tsx` that reads `nickName` atom, renders `user-secret` icon with conditional color (`MAIN_COLOR` when identity active and item inactive, drawer's `color` prop otherwise), and a red dot badge `View` when no identity
- [x] 2.2 Create `IdentityDrawerLabel` component inline in `_layout.tsx` that reads `nickName` atom, renders nickname when active or "Set Up Identity" when not
- [x] 2.3 Update `Drawer.Screen name='identity'` options to use `IdentityDrawerIcon` and `IdentityDrawerLabel` as the `drawerIcon` and `drawerLabel` render functions
