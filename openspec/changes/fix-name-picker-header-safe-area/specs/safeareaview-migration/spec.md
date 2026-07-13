## ADDED Requirements

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
