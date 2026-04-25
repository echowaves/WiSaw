## 1. Fix AppHeader SafeAreaView and Height

- [x] 1.1 Change AppHeader's SafeAreaView to use `edges={['top']}` instead of unrestricted edges
- [x] 1.2 Change AppHeader content container from `minHeight: 56` + `paddingVertical: 12` to fixed `height: 60` with vertically centered content
- [x] 1.3 Remove the `safeTopOnly` prop, the `Outer` conditional logic, and the Android `StatusBar.currentHeight` workaround from AppHeader
- [x] 1.4 Remove `safeTopOnly` usage from NamePicker

## 2. Verify All Screens

- [x] 2.1 Visually verify landing page (PhotosListHeader) is unchanged
- [x] 2.2 Visually verify Identity, Friends, Waves, Bookmarks, Feedback, and Shared Photo screens show consistent header height with no gap
- [x] 2.3 Verify NamePicker header renders correctly after removing safeTopOnly
- [x] 2.4 Test on Android to confirm SafeAreaView edges={['top']} handles status bar correctly without manual padding
