# Content Sharing Specification

## Purpose
Content sharing enables users to distribute photos and friendship invitations through multiple channels including the native share sheet, direct app-specific sharing (WhatsApp, Telegram, etc.), SMS, email, QR codes, and deep link generation via a unified share modal interface.

## Requirements

### Requirement: Native Share Sheet Integration
The system SHALL provide system-level sharing via the native OS share sheet, supporting all installed apps on the device.

#### Scenario: User shares a photo via share sheet
- **WHEN** the user taps share on a photo and selects the native share option
- **THEN** the OS share sheet opens with the photo deep link ready to distribute

### Requirement: Deep Link Generation
The system SHALL auto-generate shareable deep links for both photos and friendships.

#### Scenario: Sharing a photo
- **WHEN** a user initiates sharing for a photo
- **THEN** a deep link in the format link.wisaw.com/photos/[photoId] is generated

#### Scenario: Sharing a friendship invitation
- **WHEN** a user initiates sharing for a friendship
- **THEN** a deep link in the format link.wisaw.com/friends/[uuid] is generated

### Requirement: App-Specific Sharing
The system SHALL support direct sharing to popular apps including WhatsApp, Telegram, Facebook, Twitter, Instagram, TikTok, Snapchat, LinkedIn, Pinterest, Reddit, YouTube, Slack, and Discord.

#### Scenario: User shares to a specific app
- **WHEN** the user selects a specific app from the share options
- **THEN** the content is shared directly to that app with appropriate formatting

### Requirement: SMS Sharing
The system SHALL support sharing content via text message (SMS).

#### Scenario: User shares via SMS
- **WHEN** the user selects the SMS sharing option
- **THEN** the device messaging app opens with the share link pre-filled

### Requirement: Email Sharing
The system SHALL support sharing content via email with custom content.

#### Scenario: User shares via email
- **WHEN** the user selects the email sharing option
- **THEN** the default email client opens with the share link in the body

### Requirement: QR Code Sharing
The system SHALL generate and display QR codes for sharing photos and friendships.

#### Scenario: User shares via QR code
- **WHEN** the user selects the QR code sharing option
- **THEN** a QR code is generated and displayed for the recipient to scan

### Requirement: Unified Share Modal
The system SHALL provide a consistent sharing interface (modal) for both photos and friendships, presenting all available sharing methods.

#### Scenario: User opens share modal
- **WHEN** the user taps the share action on any shareable content
- **THEN** a unified modal presents all available sharing options in a consistent layout
