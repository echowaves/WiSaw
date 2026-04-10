## ADDED Requirements

### Requirement: Report wave photo
Any wave member SHALL be able to report a photo within a wave for abuse.

#### Scenario: Contributor reports a photo
- **WHEN** a contributor taps "Report" on a photo in the wave
- **THEN** the app SHALL call `reportWavePhoto` with `waveUuid`, `photoId`, and `uuid`
- **THEN** on success, a toast SHALL confirm the report was submitted

#### Scenario: Report on frozen wave blocked
- **WHEN** a member attempts to report a photo in a frozen wave
- **THEN** the report action SHALL NOT be available (frozen content is immutable)

### Requirement: Moderation dashboard
Owners and facilitators SHALL have access to a moderation dashboard showing reported photos in the wave.

#### Scenario: Open moderation dashboard
- **WHEN** an owner or facilitator taps "Moderation" in the wave detail menu
- **THEN** the app SHALL call `listWaveAbuseReports` and display all pending reports
- **THEN** each report SHALL show the reported photo thumbnail, reporter info, and report date

#### Scenario: Dismiss a report
- **WHEN** an owner or facilitator taps "Dismiss" on a report
- **THEN** the app SHALL call `dismissWaveReport` with `reportId` and `uuid`
- **THEN** on success, the report SHALL be removed from the queue

#### Scenario: Delete reported photo
- **WHEN** an owner or facilitator chooses to delete a reported photo from the wave
- **THEN** the app SHALL call `removePhotoFromWave` to unlink the photo from the wave
- **THEN** the report SHALL be dismissed

### Requirement: Ban user from wave
Owners and facilitators SHALL be able to permanently ban a user from a wave.

#### Scenario: Ban user
- **WHEN** an owner or facilitator taps "Ban User" on a member or from a report
- **THEN** a confirmation dialog SHALL appear explaining that the ban is permanent
- **THEN** upon confirmation, the app SHALL call `banUserFromWave` with `waveUuid`, `targetUuid`, `uuid`, and optionally `reason`
- **THEN** on success, the user SHALL be removed from the wave and added to the ban list

#### Scenario: Cannot ban wave owner
- **WHEN** a facilitator views moderation options
- **THEN** the ban option SHALL NOT be available for the wave owner

### Requirement: Facilitator identity requirement for moderation
A facilitator SHALL NOT be able to perform moderation actions (dismiss reports, ban users, delete reported photos) without first establishing an identity (secret) on the device.

#### Scenario: Facilitator without identity attempts moderation
- **WHEN** a facilitator without a registered identity attempts to dismiss a report, ban a user, or delete a reported photo
- **THEN** the app SHALL display an inline card explaining that identity is required for accountability as a moderator
- **THEN** the card SHALL include a button to navigate to the Identity screen

#### Scenario: Facilitator with identity performs moderation
- **WHEN** a facilitator with a registered identity performs a moderation action
- **THEN** the action SHALL proceed normally
