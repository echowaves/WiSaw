## Why

Multiple modals with text inputs (wave create/edit, wave selector, merge wave) have no keyboard avoidance — the keyboard overlaps input fields on smaller screens. The current keyboard handling library (`react-native-keyboard-aware-scroll-view` v0.9.5) has been unmaintained since 2021 and lacks New Architecture support. Meanwhile, `react-native-keyboard-controller` v1.20.7 is already installed but unused. Migrating to it fixes all overlap issues, removes dead dependencies, and future-proofs keyboard handling.

## What Changes

- Add `KeyboardProvider` from `react-native-keyboard-controller` at the app root layout
- Migrate all 4 screens using `react-native-keyboard-aware-scroll-view` to use `react-native-keyboard-controller`'s `KeyboardAwareScrollView`
- Add keyboard avoidance to 5 broken modals (WavesHub create/edit, WaveDetail edit, WaveSelectorModal, MergeWaveModal)
- Replace custom `useKeyboardTracking` hook in PhotosList with `KeyboardStickyView`
- Remove `react-native-keyboard-aware-scroll-view` dependency
- Remove `@rnhooks/keyboard` dependency
- Remove custom `useKeyboardTracking` hook

## Capabilities

### New Capabilities
- `keyboard-avoidance`: Project-level requirement that all screens and modals with text inputs SHALL use keyboard avoidance from `react-native-keyboard-controller`

### Modified Capabilities
- `wave-hub`: Wave create and edit modals gain keyboard avoidance
- `wave-detail`: Wave edit modal gains keyboard avoidance
- `wave-selector-modal`: Search and create inputs gain keyboard avoidance
- `wave-merge`: Search input gains keyboard avoidance
- `comments`: Comment input modal migrates keyboard library
- `user-feedback`: Feedback form migrates keyboard library
- `user-identity`: Secret screen migrates keyboard library
- `friendships`: NamePicker modal migrates keyboard library
- `photo-feed`: PhotosList search bar replaces custom keyboard tracking with `KeyboardStickyView`

## Impact

- **Root layout**: `app/_layout.tsx` — wrap with `KeyboardProvider`
- **Screens migrated** (import swap): `NamePicker`, `Secret`, `Feedback`, `ModalInputText`
- **Modals fixed**: `WavesHub` (2 modals), `WaveDetail` (1 modal), `WaveSelectorModal`, `MergeWaveModal`
- **Custom hook removed**: `src/screens/PhotosList/hooks/useKeyboardTracking.js`
- **Dependencies removed**: `react-native-keyboard-aware-scroll-view`, `@rnhooks/keyboard`
- **No API or backend changes**
