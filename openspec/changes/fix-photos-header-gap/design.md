## Context

The app previously used `SafeAreaView` from `react-native`, which does not handle safe area insets on Android. To compensate, a `useSafeAreaViewStyle` hook was created that adds `paddingTop: StatusBar.currentHeight` on Android. A recent fix (fix-android-emulator-errors) migrated some files to use `SafeAreaView` from `react-native-safe-area-context`, which handles insets automatically — but left the manual padding in place, causing double padding (a visible gap between the header and content).

## Goals / Non-Goals

**Goals:**
- Eliminate double top padding on Android across all screens
- Standardize all `SafeAreaView` usage on `react-native-safe-area-context`
- Remove the now-unnecessary `useSafeAreaViewStyle` hook

**Non-Goals:**
- Changing layout structure or header design
- Modifying non-SafeAreaView spacing or styling

## Decisions

### Remove manual padding rather than reverting to react-native SafeAreaView

**Decision:** Keep `react-native-safe-area-context`'s SafeAreaView (correct long-term solution) and remove the redundant manual `paddingTop`.

**Rationale:** `react-native-safe-area-context` is the recommended library for safe area handling in Expo/React Native. The `react-native` SafeAreaView is deprecated. The manual padding was only a workaround for the old component's limitations.

**Alternatives considered:**
- Revert to `react-native` SafeAreaView — would just bring back the deprecation warnings that the previous fix addressed

### Migrate all remaining screens in the same change

**Decision:** Migrate Chat and Secret screens (which still use `react-native` SafeAreaView) in this change too, then remove the hook entirely.

**Rationale:** Prevents future confusion and eliminates the deprecated import completely. Small scope — only 2 additional files.

## Risks / Trade-offs

- [Risk: Spacing looks different on certain Android devices with notches/cutouts] → `react-native-safe-area-context` handles these correctly; this is an improvement over the manual `StatusBar.currentHeight` approach.
