## ADDED Requirements

### Requirement: Safe notifications module loading
The system SHALL provide a wrapper module at `src/utils/notifications.js` that safely loads `expo-notifications` using a try/catch around `require()` at module scope, exporting the real module when available and no-op stubs when unavailable.

#### Scenario: Running in a development build where expo-notifications is available
- **WHEN** the app loads in a development build or production
- **THEN** the wrapper SHALL re-export the real `expo-notifications` module with full functionality

#### Scenario: Running in Expo Go SDK 53+ where expo-notifications throws on import
- **WHEN** `require('expo-notifications')` throws an error
- **THEN** the wrapper SHALL export no-op stub functions for `setBadgeCountAsync` and `requestPermissionsAsync` that resolve without error

### Requirement: All notification imports use safe wrapper
All files that previously imported `expo-notifications` directly SHALL import from `src/utils/notifications.js` instead.

#### Scenario: PhotosList/index.js uses safe wrapper
- **WHEN** `src/screens/PhotosList/index.js` is loaded
- **THEN** it SHALL import Notifications from `../../utils/notifications` instead of `expo-notifications`

#### Scenario: PhotosListFooter.js uses safe wrapper
- **WHEN** `src/screens/PhotosList/components/PhotosListFooter.js` is loaded
- **THEN** it SHALL import Notifications from `../../../utils/notifications` instead of `expo-notifications`
