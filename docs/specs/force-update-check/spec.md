## ADDED Requirements

### Requirement: Fetch AppConfig on startup
The system SHALL fetch the `AppConfig` query from the backend GraphQL API on every app startup, before any screen renders.

#### Scenario: Successful AppConfig fetch
- **WHEN** the app starts and network is available
- **THEN** the system calls `query GetAppConfig { appConfig { minAppBuild minAppVersion message } }` via Apollo Client

#### Scenario: No network — skip check
- **WHEN** the app starts and network is unavailable
- **THEN** the system skips the build version check and proceeds normally

#### Scenario: GraphQL query fails
- **WHEN** the app starts and the GraphQL query returns an error
- **THEN** the system skips the build version check and proceeds normally

#### Scenario: Backend returns null AppConfig
- **WHEN** the GraphQL query succeeds but `appConfig` is null
- **THEN** the system skips the build version check and proceeds normally

### Requirement: Compare device build number against minAppBuild
The system SHALL compare the device's current build number against `minAppBuild` from the backend AppConfig. The device build number SHALL be read from the same source as displayed in the drawer: `appConfig.expo.ios.buildNumber` on iOS and `appConfig.expo.android.versionCode` on Android.

#### Scenario: Device build meets minimum on iOS
- **WHEN** `Platform.OS === 'ios'` and `parseInt(appConfig.expo.ios.buildNumber) >= minAppBuild`
- **THEN** the build number check passes

#### Scenario: Device build meets minimum on Android
- **WHEN** `Platform.OS === 'android'` and `parseInt(appConfig.expo.android.versionCode) >= minAppBuild`
- **THEN** the build number check passes

#### Scenario: Device build below minimum
- **WHEN** `parseInt(deviceBuild) < minAppBuild`
- **THEN** the build number check fails and triggers the force update modal

### Requirement: Compare device version against minAppVersion
The system SHALL compare the device's current app version against `minAppVersion` from the backend AppConfig using semver comparison (MAJOR.MINOR.PATCH).

#### Scenario: Device version meets minimum
- **WHEN** `compareSemver(deviceVersion, minAppVersion) >= 0`
- **THEN** the version check passes

#### Scenario: Device version below minimum
- **WHEN** `compareSemver(deviceVersion, minAppVersion) < 0`
- **THEN** the version check fails and triggers the force update modal

### Requirement: Display blocking force update modal
When either the build number or version check fails, the system SHALL display a full-screen blocking modal that prevents all app interaction.

#### Scenario: Build threshold triggers modal
- **WHEN** `deviceBuild < minAppBuild` (and version passes)
- **THEN** the system displays a blocking modal with the message "A new version is ready. Tap Reload to update." (or the backend `message` if provided)

#### Scenario: Version threshold triggers modal
- **WHEN** `deviceVersion < minAppVersion` (and build passes)
- **THEN** the system displays a blocking modal with the message "A new version is available. Please update from the App Store / Google Play." (or the backend `message` if provided)

#### Scenario: Both thresholds trigger modal
- **WHEN** both `deviceBuild < minAppBuild` and `deviceVersion < minAppVersion`
- **THEN** the system displays a blocking modal with the message "A new version is available. Please update from the App Store / Google Play." (or the backend `message` if provided)

#### Scenario: Backend message provided
- **WHEN** `appConfig.message` is a non-empty string
- **THEN** the system displays `appConfig.message` instead of the fallback default message

#### Scenario: Modal content
- **WHEN** the modal is displayed
- **THEN** it shows: an alert icon, title "Update Required", the message text, and a button labeled "Reload" or "Update Now" based on trigger type

#### Scenario: Modal is blocking
- **WHEN** the modal is displayed
- **THEN** the user cannot interact with any app content behind the modal

### Requirement: Force update button action
The modal SHALL include a button that performs platform-appropriate action based on the trigger type:
- For build updates: calls `Updates.reloadAsync()` to reload the EAS Updates JS bundle
- For version updates: opens the App Store (iOS) or Google Play (Android) for native app update

#### Scenario: User taps reload button for build update
- **WHEN** `triggerType === 'build'` and user taps the button
- **THEN** the system calls `Updates.reloadAsync()` to reload the EAS Updates JS bundle

#### Scenario: User taps update button for version update
- **WHEN** `triggerType === 'version'` and user taps the button
- **THEN** the system opens the App Store (iOS) or Google Play (Android) for native app update

#### Scenario: User taps update button for both triggers
- **WHEN** `triggerType === 'both'` and user taps the button
- **THEN** the system opens the App Store (iOS) or Google Play (Android) for native app update

#### Scenario: Button labels
- **WHEN** `triggerType === 'build'`
- **THEN** the button displays "Reload"
- **WHEN** `triggerType === 'version'` or `triggerType === 'both'`
- **THEN** the button displays "Update Now"

### Requirement: Semver comparison utility
The system SHALL implement a semver comparison function that splits version strings on `.` and compares each numeric part.

#### Scenario: Same versions
- **WHEN** `compareSemver("7.5.7", "7.5.7")`
- **THEN** it returns `0`

#### Scenario: Higher version
- **WHEN** `compareSemver("7.6.0", "7.5.7")`
- **THEN** it returns a positive number

#### Scenario: Lower version
- **WHEN** `compareSemver("7.5.6", "7.5.7")`
- **THEN** it returns a negative number

#### Scenario: Missing minor/patch
- **WHEN** `compareSemver("8.0.0", "7.9.99")`
- **THEN** it returns a positive number (8 > 7)
