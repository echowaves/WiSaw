## Context

The app uses `react-native-keyboard-aware-scroll-view` (v0.9.5, unmaintained since 2021) for keyboard avoidance in 4 screens and has 5 modals with text inputs that have no keyboard handling at all. `react-native-keyboard-controller` (v1.20.7) is already installed as a dependency but unused. The app also uses a custom `useKeyboardTracking` hook (built on `@rnhooks/keyboard`) for the PhotosList search bar.

**Current keyboard handling map:**
- 4 screens use `KeyboardAwareScrollView` from the old library (NamePicker, Secret, Feedback, ModalInputText)
- 5 modal contexts have no keyboard handling (WavesHub create/edit, WaveDetail edit, WaveSelectorModal, MergeWaveModal)
- 1 screen uses custom hook with `@rnhooks/keyboard` (PhotosList)
- 1 screen uses GiftedChat's built-in handling (Chat) — not touched

## Goals / Non-Goals

**Goals:**
- Fix keyboard overlap in all 5 broken modals
- Migrate all keyboard handling to `react-native-keyboard-controller`
- Add global `KeyboardProvider` at root layout
- Remove unmaintained `react-native-keyboard-aware-scroll-view` and `@rnhooks/keyboard`
- Remove custom `useKeyboardTracking` hook
- Establish project-level requirement for keyboard avoidance

**Non-Goals:**
- Changing Chat screen keyboard behavior (GiftedChat handles it internally)
- Redesigning modal layouts or visual appearance
- Adding keyboard toolbar or autocomplete features
- Touching the `react-native-keyboard-controller` version (already installed at 1.20.7)

## Decisions

**1. Use `react-native-keyboard-controller` over alternatives**

| Option | Pros | Cons |
|--------|------|------|
| Keep old lib + fix modals | Minimal change | Unmaintained, no New Arch support |
| Migrate to `keyboard-controller` | Already installed, native animations, active | Migration effort across screens |
| Use React Native's built-in `KeyboardAvoidingView` | No dependencies | Poor Android support, no scroll integration |

Choice: **Migrate to `keyboard-controller`**. It's already installed, actively maintained, supports Reanimated (already in use), and provides `KeyboardAwareScrollView` with a compatible API so migration is mostly import swaps.

**2. Global `KeyboardProvider` at root layout**

Wrap the entire app in `KeyboardProvider` in `app/_layout.tsx`. This enables keyboard-aware behavior globally — individual screens just use the components without needing to set up a provider.

**3. `KeyboardAwareScrollView` for modals, `KeyboardStickyView` for search bar**

- Modals with form inputs: wrap content in `KeyboardAwareScrollView` — this scrolls content up when keyboard appears
- PhotosList search bar: use `KeyboardStickyView` which sticks a view above the keyboard — replaces the entire custom `useKeyboardTracking` hook

**4. Screen-by-screen migration, not big-bang**

Migrate each screen independently so each can be tested in isolation. The old library import and new library import can coexist temporarily since both are installed.

## Risks / Trade-offs

[API differences] `keyboard-controller`'s `KeyboardAwareScrollView` has similar but not identical props to the old library. → Review each screen's props during migration. Key differences: `extraScrollHeight` → `bottomOffset`, `enableOnAndroid` is not needed (native Android support built-in).

[Modal behavior] `keyboard-controller` requires `KeyboardProvider` to be an ancestor. Modals using React Native's `<Modal>` component create a new React root. → Use `statusBarTranslucent` prop on `KeyboardProvider` and test modal keyboard behavior on both platforms.

[GiftedChat interaction] The global `KeyboardProvider` might interact with GiftedChat's internal keyboard handling. → Test Chat screen after adding provider. GiftedChat 3.x should be compatible.

## Migration Plan

1. Add `KeyboardProvider` to `app/_layout.tsx` (wrapping Stack)
2. Migrate 4 existing screens (swap import from old → new library)
3. Add `KeyboardAwareScrollView` to 5 broken modals
4. Replace `useKeyboardTracking` + `PhotosListSearchBar` positioning with `KeyboardStickyView`
5. Remove `react-native-keyboard-aware-scroll-view` from package.json
6. Remove `@rnhooks/keyboard` from package.json
7. Delete `useKeyboardTracking.js` hook file
8. Test all screens on iOS and Android
