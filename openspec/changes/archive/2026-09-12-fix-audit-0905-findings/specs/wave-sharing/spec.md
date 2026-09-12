## MODIFIED Requirements

### Requirement: Wave share modal
The app SHALL provide a `WaveShareModal` component that generates a QR code and shareable link for a wave. The modal SHALL adapt its behavior based on whether the wave is open or invite-only. For invite-only waves, the modal SHALL create the invite token when the modal opens and SHALL re-create it only when the user explicitly commits a changed invite option — never on intermediate keystrokes while the user is still editing an option field. The modal's open/re-create behavior SHALL be keyed on the wave's stable identity (`waveUuid`), not on the object identity of the `wave` prop, so that a parent re-render that constructs a fresh wave object for the same wave does not re-trigger `createWaveInvite`.

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

#### Scenario: Parent re-render does not re-fire invite creation
- **WHEN** the parent screen re-renders while the share modal is open or between open/close cycles for the same wave
- **AND** the parent passes a newly constructed wave object with the same `waveUuid`
- **THEN** the modal SHALL NOT call `createWaveInvite` again as a result of the prop identity change alone
- **THEN** the existing invite token and QR code SHALL remain unchanged until the user commits a new option or explicitly regenerates
