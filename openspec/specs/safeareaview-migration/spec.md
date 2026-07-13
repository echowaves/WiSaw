## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for safeareaview migration in WiSaw.

## ADDED Requirements

## Requirements

### Requirement: SafeAreaView uses react-native-safe-area-context
All usages of `SafeAreaView` SHALL import from `react-native-safe-area-context` instead of the core `react-native` package.

#### Scenario: No deprecation warning at runtime
- **WHEN** the app starts and renders screens using SafeAreaView
- **THEN** no deprecation warning about SafeAreaView is emitted

#### Scenario: AppHeader renders with top-only safe area insets
- **WHEN** AppHeader is displayed on any screen
- **THEN** SafeAreaView from react-native-safe-area-context wraps the header content with `edges={['top']}` only

#### Scenario: AppHeader content height matches landing page
- **WHEN** AppHeader is displayed on any screen
- **THEN** the header content area SHALL have a fixed height of 60px, matching PhotosListHeader

#### Scenario: No safeTopOnly prop
- **WHEN** a component renders AppHeader
- **THEN** AppHeader SHALL NOT accept a `safeTopOnly` prop — top-only behavior is the default and only mode

#### Scenario: TandC modal renders with safe area
- **WHEN** the Terms & Conditions modal is displayed
- **THEN** SafeAreaView from react-native-safe-area-context wraps the modal content

### Requirement: Full-screen Modals using AppHeader must be wrapped in SafeAreaProvider
Any component that renders `AppHeader` inside a React Native `Modal` with `presentationStyle='fullScreen'` SHALL wrap the Modal's content in a nested `SafeAreaProvider` so that `SafeAreaView` and `useSafeAreaInsets()` resolve correct insets.

#### Scenario: NamePicker header respects status bar
- **WHEN** the NamePicker modal is displayed on iOS
- **THEN** the AppHeader SHALL render below the status bar with correct top safe area padding
- **THEN** the back button SHALL be fully visible and tappable

#### Scenario: NamePicker bottom insets resolve correctly
- **WHEN** the NamePicker modal is displayed
- **THEN** `useSafeAreaInsets()` inside the modal SHALL return non-zero bottom inset on devices with home indicator
- **THEN** the KeyboardAwareScrollView padding SHALL use the correct bottom inset value
