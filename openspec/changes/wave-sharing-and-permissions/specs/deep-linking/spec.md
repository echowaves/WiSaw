## MODIFIED Requirements

### Requirement: Photo Deep Links
The system SHALL support direct links to specific photos via link.wisaw.com/photos/[photoId] and wisaw.com/photos/[photoId] URLs.

#### Scenario: User opens a photo deep link
- **WHEN** a user taps a photo deep link on their device
- **THEN** the app opens and navigates directly to the shared photo detail view

### Requirement: Friendship Deep Links
The system SHALL support friendship invitation links via link.wisaw.com/friends/[uuid] and wisaw.com/friends/[uuid] URLs.

#### Scenario: User opens a friendship deep link
- **WHEN** a user taps a friendship invitation link
- **THEN** the app opens and navigates to the friendship confirmation screen

### Requirement: Wave Deep Links
The system SHALL support wave deep links via link.wisaw.com/wave/join/[waveUuid] and link.wisaw.com/wave/invite/[inviteToken] URLs.

#### Scenario: User opens a wave join deep link
- **WHEN** a user taps a wave join link on their device
- **THEN** the app opens and navigates to the wave join confirmation screen with the waveUuid

#### Scenario: User opens a wave invite deep link
- **WHEN** a user taps a wave invite link on their device
- **THEN** the app opens and navigates to the wave join confirmation screen with the inviteToken

### Requirement: Cold Start Deep Link Handling
The system SHALL properly handle app launch via deep link by delaying navigation until the Expo Router is fully ready.

#### Scenario: App is not running when link is tapped
- **WHEN** the user taps a deep link while the app is not running
- **THEN** the app launches, waits for the router to be ready, and then navigates to the linked content

### Requirement: Warm Start Deep Link Handling
The system SHALL seamlessly navigate to deep-linked content when the app is already running in the foreground or background.

#### Scenario: App is already running when link is tapped
- **WHEN** the user taps a deep link while the app is already running
- **THEN** the app navigates directly to the linked content without restart

### Requirement: Navigation Parameter Passing
The system SHALL pass route parameters with proper JSON serialization and deserialization when navigating via deep links.

#### Scenario: Deep link contains parameters
- **WHEN** a deep link with route parameters is processed
- **THEN** the parameters are correctly deserialized and passed to the destination screen
