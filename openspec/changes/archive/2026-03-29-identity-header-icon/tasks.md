## 1. IdentityHeaderIcon Component

- [x] 1.1 Create `src/components/IdentityHeaderIcon/index.js` with the icon rendering: read `nickName` atom, render `user-secret` icon with conditional color (`theme.TEXT_SECONDARY` when no identity, `MAIN_COLOR` when active), red dot `Badge` from `@rneui/themed` when no identity
- [x] 1.2 Add popover state and rendering: `useState` for `isOpen`, absolutely-positioned dropdown `View` with a single menu row (icon + label), full-screen transparent `TouchableWithoutFeedback` backdrop for outside-tap dismissal
- [x] 1.3 Wire popover row tap to `router.push('/(drawer)/identity')` and dismiss popover; show `user-plus` + "Set Up Identity" when no identity, `user-secret` + nickname when identity active

## 2. Header Integration

- [x] 2.1 Replace the empty 40x40 left `View` in `src/screens/PhotosList/components/PhotosListHeader.js` with `IdentityHeaderIcon`
