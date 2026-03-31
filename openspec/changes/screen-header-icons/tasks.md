## 1. Create shared icon map and component

- [x] 1.1 Create `src/theme/screenIcons.tsx` with `SCREEN_HEADER_ICONS` constant map containing entries for identity (FontAwesome/user-secret), friends (FontAwesome5/user-friends), waves (FontAwesome5/water), and feedback (MaterialIcons/feedback)
- [x] 1.2 Implement `ScreenIconTitle` component in the same file that renders icon + title in a horizontal row, reading theme for text color, with Identity-aware logic (reads `nickName` atom, applies `MAIN_COLOR` when set, red badge dot when not)

## 2. Update screen headers to use ScreenIconTitle

- [x] 2.1 Update `app/(drawer)/identity.tsx` to pass `<ScreenIconTitle screenKey='identity' />` as `title` to `AppHeader`
- [x] 2.2 Update `app/(drawer)/friends.tsx` to pass `<ScreenIconTitle screenKey='friends' />` as `title` to `AppHeader`
- [x] 2.3 Update `app/(drawer)/waves/index.tsx` to pass `<ScreenIconTitle screenKey='waves' />` as `title` to `AppHeader`
- [x] 2.4 Update `src/screens/Feedback/index.js` to pass `<ScreenIconTitle screenKey='feedback' />` as `title` to `AppHeader` (both online and offline header instances)

## 3. Refactor drawer to use shared icon map

- [x] 3.1 Update `app/(drawer)/_layout.tsx` Friends drawer icon to reference `SCREEN_HEADER_ICONS.friends`
- [x] 3.2 Update `app/(drawer)/_layout.tsx` Feedback drawer icon to reference `SCREEN_HEADER_ICONS.feedback`
- [x] 3.3 Update `app/(drawer)/_layout.tsx` IdentityDrawerIcon to reference `SCREEN_HEADER_ICONS.identity` for icon name/library
- [x] 3.4 Update `app/(drawer)/_layout.tsx` WavesDrawerIcon to reference `SCREEN_HEADER_ICONS.waves` for icon name/library
