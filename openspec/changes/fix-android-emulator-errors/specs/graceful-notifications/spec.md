## ADDED Requirements

### Requirement: Notification API calls degrade gracefully
The system SHALL wrap all `expo-notifications` API calls in try/catch so the app does not crash when the native module is unavailable.

#### Scenario: App loads in Expo Go without expo-notifications
- **WHEN** the app is loaded in Expo Go on SDK 53+ where expo-notifications native module is removed
- **THEN** the app SHALL load successfully without crashing

#### Scenario: Badge count update in Expo Go
- **WHEN** the system attempts to call `Notifications.setBadgeCountAsync` and the native module is unavailable
- **THEN** the call SHALL be silently caught and the app SHALL continue running

#### Scenario: Permission request in Expo Go
- **WHEN** the system attempts to call `Notifications.requestPermissionsAsync` and the native module is unavailable
- **THEN** the call SHALL be silently caught and the app SHALL continue running

### Requirement: No deprecated SafeAreaView imports
The system SHALL NOT import `SafeAreaView` from `react-native`. All SafeAreaView usage SHALL come from `react-native-safe-area-context`.

#### Scenario: No deprecation warning for SafeAreaView
- **WHEN** the app is loaded
- **THEN** no deprecation warning about SafeAreaView SHALL appear in the console
