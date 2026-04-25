## MODIFIED Requirements

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
