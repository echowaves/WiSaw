## 1. Foundation: Jotai Atom

- [x] 1.1 Create `src/atoms/errorAtom.js` with `errorContextAtom` — stores `{ visible, title, message, stack }`
- [x] 1.2 Export `setShowErrorAtom` and `hideErrorAtom` helper functions alongside the atom (note: exported as `setShowErrorAtom`/`hideErrorAtom`, not `showErrorContext`/`hideErrorContext`)

## 2. Foundation: ErrorDetailModal Component

- [x] 2.1 Create `src/components/ErrorDetailModal/index.js` with modal structure (header, title, message, stack trace, dismiss button)
- [x] 2.2 Implement slide-up animation using `react-native-reanimated` (spring animation on mount, spring animation on unmount)
- [x] 2.3 Implement swipe-down gesture handler using `react-native-gesture-handler` to dismiss
- [x] 2.4 Implement backdrop tap dismissal (tap on overlay, not on modal content)
- [x] 2.5 Implement stack trace expand/collapse on long-press (collapsed by default)
- [x] 2.6 Implement haptic feedback on modal open and stack trace toggle using `expo-haptics`
- [x] 2.7 Style to match existing app theme (dark mode support via `isDarkMode` atom)

## 3. Foundation: showErrorToast Helper

- [x] 3.1 Create `src/utils/showErrorToast.js` — accepts `{ title, message, stack, topOffset, visibilityTime }`
- [x] 3.2 Helper sets `errorAtom` to show toast with `onPress` callback that opens modal
- [x] 3.3 Helper sets `visibilityTime: 8000` and `type: 'error'` by default
- [x] 3.4 Helper handles case where `message` is an Error object (extract `.message` and `.stack`)
- [x] 3.5 Helper handles case where `message` is a string
- [x] 3.6 Helper handles case where `stack` is undefined (no stack trace section in modal)

## 4. Foundation: Layout Wiring

- [x] 4.1 Add `Toast.config()` in `app/_layout.tsx` to customize error toast appearance (add "[▶]" indicator, increase visibility to 8s)
- [x] 4.2 Import and render `<ErrorDetailModal />` next to `<Toast />` in `app/_layout.tsx`
- [x] 4.3 Test with a hardcoded error toast to verify end-to-end flow works

## 5. Migrate: Photo Reducer Error Toasts

- [x] 5.1 Replace error `Toast.show()` calls in `src/components/Photo/reducer.js` (~6 calls) with `showErrorToast()`
- [x] 5.2 Pass `err.stack` where available for full stack trace in modal

## 6. Migrate: Photo Actions Hook Error Toasts

- [x] 6.1 Replace error `Toast.show()` calls in `src/hooks/usePhotoActions.js` (~8 calls) with `showErrorToast()`
- [x] 6.2 Pass `err.stack` where available

## 7. Migrate: Wave Join Screen Error Toasts

- [x] 7.1 Replace error `Toast.show()` calls in `app/(drawer)/waves/join.tsx` (~1 call) with `showErrorToast()`

## 8. Migrate: Remaining Error Toasts

- [x] 8.1 Replace error `Toast.show()` calls in `src/components/Photo/index.js` (~0 calls — only `type: 'info'` toasts remain, no error toasts)
- [x] 8.2 Replace error `Toast.show()` calls in `src/screens/Secret/index.js` (~1 call)
- [x] 8.3 Replace error `Toast.show()` calls in `src/screens/FriendDetail/index.js` (~2 calls)
- [x] 8.4 Replace error `Toast.show()` calls in `src/components/ShareOptionsModal.js` (~2 calls)
- [x] 8.5 Replace error `Toast.show()` calls in `src/components/WaveShareModal.js` (~2 calls)
- [x] 8.6 Replace error `Toast.show()` calls in `src/components/PhotoActionButtons/index.js` (~2 calls)
- [x] 8.7 Replace error `Toast.show()` calls in `app/_layout.tsx` (~1 call — navigation error)
- [x] 8.8 Replace error `Toast.show()` calls in `app/tandc-modal.tsx` (~1 call)
- [x] 8.9 Replace remaining error toasts in other screens (WavesHub, WaveDetail, etc.) — all migrated
