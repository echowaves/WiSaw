## ADDED Requirements

### Requirement: All SafeAreaView usage relies on react-native-safe-area-context automatic insets
All screens that use `SafeAreaView` SHALL import it from `react-native-safe-area-context` and SHALL NOT apply additional manual padding for status bar or safe area insets.

#### Scenario: PhotosList header has no double padding on Android
- **WHEN** PhotosList renders on Android
- **THEN** the header SHALL have only the automatic safe area inset applied (no manual `paddingTop` via `useSafeAreaViewStyle`)

#### Scenario: ConfirmFriendship screen has no double padding
- **WHEN** ConfirmFriendship renders on Android
- **THEN** the SafeAreaView SHALL have only automatic insets (no `useSafeAreaViewStyle`)

#### Scenario: Chat screen uses react-native-safe-area-context
- **WHEN** Chat screen renders
- **THEN** it SHALL use `SafeAreaView` from `react-native-safe-area-context` without manual padding

#### Scenario: Secret screen uses react-native-safe-area-context
- **WHEN** Secret screen renders
- **THEN** it SHALL use `SafeAreaView` from `react-native-safe-area-context` without manual padding

### Requirement: Custom SafeAreaView wrapper passes through without adding padding
The custom `SafeAreaView` component at `src/components/SafeAreaView/index.js` SHALL pass styles through to `react-native-safe-area-context`'s SafeAreaView without adding additional padding.

#### Scenario: Custom SafeAreaView does not add paddingTop
- **WHEN** the custom SafeAreaView component is rendered on Android
- **THEN** it SHALL NOT add `paddingTop: statusBarHeight` since the underlying component already handles insets

### Requirement: useSafeAreaViewStyle hook is removed
The `useSafeAreaViewStyle` export SHALL be removed from `src/hooks/useStatusBarHeight.js` once no consumers remain.

#### Scenario: No imports of useSafeAreaViewStyle exist
- **WHEN** the codebase is searched for `useSafeAreaViewStyle`
- **THEN** no source files SHALL import it (except the hook definition file, which removes the export)
