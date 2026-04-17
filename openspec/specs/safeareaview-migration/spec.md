## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for safeareaview migration in WiSaw.

## ADDED Requirements

## Requirements

### Requirement: SafeAreaView uses react-native-safe-area-context
All usages of `SafeAreaView` SHALL import from `react-native-safe-area-context` instead of the core `react-native` package.

#### Scenario: No deprecation warning at runtime
- **WHEN** the app starts and renders screens using SafeAreaView
- **THEN** no deprecation warning about SafeAreaView is emitted

#### Scenario: AppHeader renders with safe area insets
- **WHEN** AppHeader is displayed with safeTopOnly=false
- **THEN** SafeAreaView from react-native-safe-area-context wraps the header content with all-edge insets

#### Scenario: TandC modal renders with safe area
- **WHEN** the Terms & Conditions modal is displayed
- **THEN** SafeAreaView from react-native-safe-area-context wraps the modal content
