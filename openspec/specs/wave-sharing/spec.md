## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for wave sharing in WiSaw.

## Requirements

### Requirement: Wave share modal
The app SHALL provide a `WaveShareModal` component that generates a QR code and shareable link for a wave. The modal SHALL adapt its behavior based on whether the wave is open or invite-only.

#### Scenario: Sharing an open wave
- **WHEN** the owner or facilitator opens the share modal for an open wave
- **THEN** the modal SHALL display a QR code encoding the wave's `joinUrl`
- **THEN** the modal SHALL display a "Share Link" button that triggers the system share sheet with the `joinUrl`

#### Scenario: Sharing an invite-only wave
- **WHEN** the owner or facilitator opens the share modal for an invite-only (non-open) wave
- **THEN** the modal SHALL call `createWaveInvite` to generate a new invite token
- **THEN** the modal SHALL display a QR code encoding the returned `deepLink`
- **THEN** the modal SHALL display a "Share Invitation" button that triggers the system share sheet with the `deepLink`

#### Scenario: Invite options for invite-only waves
- **WHEN** sharing an invite-only wave
- **THEN** the modal SHALL allow optionally setting an expiration date for the invite
- **THEN** the modal SHALL allow optionally setting a maximum number of uses for the invite

### Requirement: Share access control
Only owners and facilitators SHALL be able to access the wave share functionality.

#### Scenario: Owner sees share option
- **WHEN** the user is an owner of the wave
- **THEN** the wave detail header menu and wave hub context menu SHALL display a "Share Wave" option

#### Scenario: Facilitator sees share option
- **WHEN** the user is a facilitator of the wave
- **THEN** the wave detail header menu and wave hub context menu SHALL display a "Share Wave" option

#### Scenario: Contributor does not see share option
- **WHEN** the user is a contributor of the wave
- **THEN** the wave detail header menu and wave hub context menu SHALL NOT display a "Share Wave" option

### Requirement: QR code rendering
The wave share modal SHALL render a QR code using the `react-qr-code` library with the wave's shareable URL.

#### Scenario: QR code displays for open wave
- **WHEN** the share modal is showing an open wave
- **THEN** a QR code SHALL be rendered encoding the wave's `joinUrl`
- **THEN** the QR code SHALL use the same styling as the friendship `ShareOptionsModal` (size: 160, bgColor: white, fgColor: black, level: M)

#### Scenario: QR code displays for invite wave
- **WHEN** the share modal is showing an invite-only wave and the invite has been created
- **THEN** a QR code SHALL be rendered encoding the invite's `deepLink`

### Requirement: System share integration
The share modal SHALL use the native share sheet to allow sending the wave link via email, SMS, messaging apps, or any other share target supported by the device.

#### Scenario: User taps share button
- **WHEN** the user taps the share button in the wave share modal
- **THEN** the native share sheet SHALL open with the wave's shareable URL and a descriptive message including the wave name
