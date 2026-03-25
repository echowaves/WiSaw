## 1. Root Setup

- [x] 1.1 Add `KeyboardProvider` from `react-native-keyboard-controller` wrapping the Stack in `app/_layout.tsx`

## 2. Migrate Existing Screens (import swap)

- [x] 2.1 Migrate `src/screens/ModalInputText/index.js` — swap `KeyboardAwareScrollView` import to `react-native-keyboard-controller` and adjust props
- [x] 2.2 Migrate `src/components/NamePicker/index.js` — swap `KeyboardAwareScrollView` import to `react-native-keyboard-controller` and adjust props
- [x] 2.3 Migrate `src/screens/Feedback/index.js` — swap `KeyboardAwareScrollView` import to `react-native-keyboard-controller` and adjust props
- [x] 2.4 Migrate `src/screens/Secret/index.js` — swap `KeyboardAwareScrollView` import to `react-native-keyboard-controller` and adjust props

## 3. Fix Broken Modals (add keyboard avoidance)

- [x] 3.1 Add `KeyboardAvoidingView` to WavesHub create wave modal in `src/screens/WavesHub/index.js`
- [x] 3.2 Add `KeyboardAvoidingView` to WavesHub edit wave modal in `src/screens/WavesHub/index.js`
- [x] 3.3 Add `KeyboardAvoidingView` to WaveDetail edit modal in `src/screens/WaveDetail/index.js`
- [x] 3.4 Add `KeyboardAvoidingView` to `src/components/WaveSelectorModal/index.js`
- [x] 3.5 Add `KeyboardAvoidingView` to `src/components/MergeWaveModal/index.js`

## 4. Replace Custom Keyboard Tracking

- [x] 4.1 Replace `useKeyboardTracking` usage in `src/screens/PhotosList/components/PhotosListSearchBar.js` with `KeyboardStickyView` from `react-native-keyboard-controller`
- [x] 4.2 Delete `src/screens/PhotosList/hooks/useKeyboardTracking.js`

## 5. Cleanup Dependencies

- [x] 5.1 Remove `react-native-keyboard-aware-scroll-view` from package.json and run `npm install`
- [x] 5.2 Remove `@rnhooks/keyboard` from package.json and run `npm install`
