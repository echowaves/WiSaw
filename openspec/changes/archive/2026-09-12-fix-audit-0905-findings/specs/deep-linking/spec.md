## MODIFIED Requirements

### Requirement: Wave Deep Links
The system SHALL support wave deep links via link.wisaw.com/wave/join/[waveUuid] and link.wisaw.com/wave/invite/[inviteToken] URLs. Both iOS Universal Links and Android App Links SHALL be configured to open these wave paths directly in the app. Android `intentFilters` in the app config SHALL declare data hosts and path prefixes covering `link.wisaw.com/wave/join` and `link.wisaw.com/wave/invite`, mirroring the existing `/photos` and `/friends` intentFilter entries.

#### Scenario: User opens a wave join deep link
- **WHEN** a user taps a wave join link on their device
- **THEN** the app opens and navigates to the wave join confirmation screen with the waveUuid

#### Scenario: User opens a wave invite deep link
- **WHEN** a user taps a wave invite link on their device
- **THEN** the app opens and navigates to the wave join confirmation screen with the inviteToken

#### Scenario: Wave link opens in app on Android
- **WHEN** a user taps a `link.wisaw.com/wave/join/*` or `link.wisaw.com/wave/invite/*` link on an Android device with verified App Links
- **THEN** the link SHALL open directly in the WiSaw app, not a browser
- **THEN** the app SHALL navigate to the wave join confirmation screen with the waveUuid or inviteToken

#### Scenario: Wave link on Android without verified links
- **WHEN** a user taps a wave link on an Android device where App Links are not yet verified
- **THEN** the system SHALL show the standard Android disambiguation chooser offering the WiSaw app and a browser
