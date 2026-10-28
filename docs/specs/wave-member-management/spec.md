## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for wave member management in WiSaw.

## Requirements

### Requirement: Wave members list
The app SHALL provide a screen listing all members of a wave with their roles, accessible to owners and facilitators.

#### Scenario: Owner views member list
- **WHEN** the wave owner taps "Manage Members" in the wave detail menu
- **THEN** a screen SHALL display all wave members with their nicknames (or anonymous UUID prefix), roles, and join dates
- **THEN** members SHALL be grouped or sorted by role (owners first, then facilitators, then contributors)

#### Scenario: Facilitator views member list
- **WHEN** a facilitator taps "Manage Members" in the wave detail menu
- **THEN** a screen SHALL display all wave members with their roles
- **THEN** the facilitator SHALL see options to remove users and ban users, but NOT assign/remove facilitator roles

### Requirement: Assign facilitator
The wave owner SHALL be able to promote a contributor to facilitator role.

#### Scenario: Owner assigns facilitator
- **WHEN** the wave owner taps a contributor in the members list and selects "Make Facilitator"
- **THEN** the app SHALL call the `assignFacilitator` mutation with `waveUuid`, `targetUuid`, and `uuid`
- **THEN** on success, the member's role SHALL update to "facilitator" in the list

#### Scenario: Non-owner cannot assign facilitator
- **WHEN** a facilitator or contributor views the member list
- **THEN** the "Make Facilitator" option SHALL NOT be available

### Requirement: Remove facilitator
The wave owner SHALL be able to demote a facilitator back to contributor role.

#### Scenario: Owner removes facilitator role
- **WHEN** the wave owner taps a facilitator in the members list and selects "Remove Facilitator"
- **THEN** the app SHALL call the `removeFacilitator` mutation with `waveUuid`, `targetUuid`, and `uuid`
- **THEN** on success, the member's role SHALL update to "contributor" in the list

### Requirement: Remove user from wave
Owners and facilitators SHALL be able to remove a user from the wave.

#### Scenario: Owner removes a member
- **WHEN** the wave owner selects "Remove from Wave" for a member
- **THEN** a confirmation dialog SHALL appear
- **THEN** upon confirmation, the app SHALL call `removeUserFromWave` with `waveUuid`, `targetUuid`, and `uuid`
- **THEN** on success, the member SHALL be removed from the list

#### Scenario: Facilitator removes a contributor
- **WHEN** a facilitator selects "Remove from Wave" for a contributor
- **THEN** a confirmation dialog SHALL appear
- **THEN** upon confirmation, the app SHALL call `removeUserFromWave`
- **THEN** on success, the member SHALL be removed from the list

#### Scenario: Cannot remove owner
- **WHEN** a facilitator views the member list
- **THEN** the "Remove from Wave" option SHALL NOT be available for the wave owner

### Requirement: Wave invite management
Owners and facilitators SHALL be able to view and revoke active invites for invite-only waves.

#### Scenario: View active invites
- **WHEN** the owner or facilitator opens invite management for an invite-only wave
- **THEN** the app SHALL call `listWaveInvites` and display all invites with their token (truncated), creation date, expiration, max uses, and current use count

#### Scenario: Revoke an invite
- **WHEN** the owner or facilitator taps "Revoke" on an active invite
- **THEN** the app SHALL call `revokeWaveInvite` with the invite token and uuid
- **THEN** on success, the invite SHALL be marked as revoked in the list

### Requirement: View banned users
Owners and facilitators SHALL be able to view the list of banned users.

#### Scenario: View ban list
- **WHEN** the owner or facilitator opens the ban list
- **THEN** the app SHALL call `listWaveBans` and display banned users with ban date and reason
