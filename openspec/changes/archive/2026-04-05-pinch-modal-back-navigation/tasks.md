## 1. Create root-level pinch route

- [x] 1.1 Create `app/pinch.tsx` with the same content as current `app/(drawer)/(tabs)/pinch.tsx`, using `useLocalSearchParams` and `useRouter` from expo-router to parse photo params and pass navigation to `PinchableView`

## 2. Register pinch in root layout

- [x] 2.1 Add `<Stack.Screen name="pinch">` to `app/_layout.tsx` with `presentation: 'fullScreenModal'`, `gestureEnabled: false`, and `headerShown: false`

## 3. Remove pinch from tabs stack

- [x] 3.1 Delete `app/(drawer)/(tabs)/pinch.tsx`
- [x] 3.2 Remove the `<Stack.Screen name='pinch'>` entry from `app/(drawer)/(tabs)/_layout.tsx`

## 4. Fix pinch header safe area in modal context

- [x] 4.1 In `PinchableView.js`, replace `SafeAreaView` wrapper with a plain `View` using `paddingTop: insets.top` from `useSafeAreaInsets()` to ensure the back button renders below the status bar in fullScreenModal presentation

## 5. Move GestureHandlerRootView to root layout

- [x] 5.1 Add `GestureHandlerRootView` wrapper in `app/_layout.tsx` around the entire app content
- [x] 5.2 Remove `GestureHandlerRootView` from `app/(drawer)/_layout.tsx` and fix indentation

## 6. Verify

- [x] 6.1 Confirm the app compiles without errors
- [x] 6.2 Test back navigation from pinch returns to origin on PhotosList, BookmarksList, WaveDetail, FriendDetail, and PhotosDetailsShared
