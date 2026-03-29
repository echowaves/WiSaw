## 1. Fix Popover Rendering

- [x] 1.1 Replace the absolutely-positioned popover and `position: 'fixed'` backdrop in `src/components/IdentityHeaderIcon/index.js` with a `<Modal visible={isOpen} transparent animationType="fade">` wrapping a full-screen `TouchableWithoutFeedback` backdrop and the popover `View`
- [x] 1.2 Position the popover inside the Modal using `useSafeAreaInsets().top + 60` (header height) for `top` and `left: 16` to align with the icon

## 2. Clean Up Header

- [x] 2.1 Remove `zIndex: 100` from the identity icon wrapper `View` in `src/screens/PhotosList/components/PhotosListHeader.js` since the popover no longer renders in the header hierarchy
