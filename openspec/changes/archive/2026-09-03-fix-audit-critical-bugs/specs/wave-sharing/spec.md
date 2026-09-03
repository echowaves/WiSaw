## MODIFIED Requirements

### Requirement: Wave share modal
The app SHALL provide a `WaveShareModal` component that generates a QR code and shareable link for a wave. The modal SHALL adapt its behavior based on whether the wave is open or invite-only. For invite-only waves, the modal SHALL create the invite token when the modal opens and SHALL re-create it only when the user explicitly commits a changed invite option — never on intermediate keystrokes while the user is still editing an option field.

#### Scenario: Sharing an open wave
- **WHEN** the owner or facilitator opens the share modal for an open wave
- **THEN** the modal SHALL display a QR code encoding the wave's `joinUrl`
- **THEN** the modal SHALL display a "Share Link" button that triggers the system share sheet with the `joinUrl`

#### Scenario: Sharing an invite-only wave
- **WHEN** the owner or facilitator opens the share modal for an invite-only (non-open) wave
- **THEN** the modal SHALL call `createWaveInvite` exactly once to generate an invite token
- **THEN** the modal SHALL display a QR code encoding the returned `deepLink`
- **THEN** the modal SHALL display a "Share Invitation" button that triggers the system share sheet with the `deepLink`

#### Scenario: Invite options for invite-only waves
- **WHEN** sharing an invite-only wave
- **THEN** the modal SHALL allow optionally setting an expiration date for the invite
- **THEN** the modal SHALL allow optionally setting a maximum number of uses for the invite

#### Scenario: Editing invite option fields
- **WHEN** the user is editing the expiration or max-uses field of an invite-only share modal
- **AND** the user has not committed the new value
- **THEN** the modal SHALL NOT call `createWaveInvite`
- **WHEN** the user commits a changed option value
- **THEN** the modal SHALL call `createWaveInvite` with the committed parameters
- **THEN** the displayed QR code and link SHALL reflect the new invite
