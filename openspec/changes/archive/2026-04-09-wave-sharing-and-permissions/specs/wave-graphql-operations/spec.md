## ADDED Requirements

### Requirement: Join open wave mutation
The frontend SHALL provide a `joinOpenWave` function that calls the GraphQL `joinOpenWave` mutation.

#### Scenario: Join open wave
- **WHEN** `joinOpenWave` is called with `waveUuid` and `uuid`
- **THEN** the function SHALL execute the mutation and return the Wave object on success

### Requirement: Join wave by invite mutation
The frontend SHALL provide a `joinWaveByInvite` function that calls the GraphQL `joinWaveByInvite` mutation.

#### Scenario: Join wave by invite
- **WHEN** `joinWaveByInvite` is called with `inviteToken` and `uuid`
- **THEN** the function SHALL execute the mutation and return the Wave object on success

### Requirement: Create wave invite mutation
The frontend SHALL provide a `createWaveInvite` function that calls the GraphQL `createWaveInvite` mutation.

#### Scenario: Create wave invite
- **WHEN** `createWaveInvite` is called with `waveUuid`, `uuid`, and optional `expiresAt` and `maxUses`
- **THEN** the function SHALL execute the mutation and return the WaveInvite object including `inviteToken`, `deepLink`, `expiresAt`, `maxUses`, `useCount`, `active`, and `createdAt`

### Requirement: Revoke wave invite mutation
The frontend SHALL provide a `revokeWaveInvite` function that calls the GraphQL `revokeWaveInvite` mutation.

#### Scenario: Revoke wave invite
- **WHEN** `revokeWaveInvite` is called with `inviteToken` and `uuid`
- **THEN** the function SHALL execute the mutation and return a boolean indicating success

### Requirement: Assign facilitator mutation
The frontend SHALL provide an `assignFacilitator` function that calls the GraphQL `assignFacilitator` mutation.

#### Scenario: Assign facilitator
- **WHEN** `assignFacilitator` is called with `waveUuid`, `targetUuid`, and `uuid`
- **THEN** the function SHALL execute the mutation and return a boolean indicating success

### Requirement: Remove facilitator mutation
The frontend SHALL provide a `removeFacilitator` function that calls the GraphQL `removeFacilitator` mutation.

#### Scenario: Remove facilitator
- **WHEN** `removeFacilitator` is called with `waveUuid`, `targetUuid`, and `uuid`
- **THEN** the function SHALL execute the mutation and return a boolean indicating success

### Requirement: Remove user from wave mutation
The frontend SHALL provide a `removeUserFromWave` function that calls the GraphQL `removeUserFromWave` mutation.

#### Scenario: Remove user from wave
- **WHEN** `removeUserFromWave` is called with `waveUuid`, `targetUuid`, and `uuid`
- **THEN** the function SHALL execute the mutation and return a boolean indicating success

### Requirement: Report wave photo mutation
The frontend SHALL provide a `reportWavePhoto` function that calls the GraphQL `reportWavePhoto` mutation.

#### Scenario: Report wave photo
- **WHEN** `reportWavePhoto` is called with `waveUuid`, `photoId`, and `uuid`
- **THEN** the function SHALL execute the mutation and return the AbuseReport object

### Requirement: Dismiss wave report mutation
The frontend SHALL provide a `dismissWaveReport` function that calls the GraphQL `dismissWaveReport` mutation.

#### Scenario: Dismiss wave report
- **WHEN** `dismissWaveReport` is called with `reportId` and `uuid`
- **THEN** the function SHALL execute the mutation and return a boolean indicating success

### Requirement: Ban user from wave mutation
The frontend SHALL provide a `banUserFromWave` function that calls the GraphQL `banUserFromWave` mutation.

#### Scenario: Ban user from wave
- **WHEN** `banUserFromWave` is called with `waveUuid`, `targetUuid`, `uuid`, and optional `reason`
- **THEN** the function SHALL execute the mutation and return a boolean indicating success

### Requirement: List wave members query
The frontend SHALL provide a `listWaveMembers` function that calls the GraphQL `listWaveMembers` query.

#### Scenario: List wave members
- **WHEN** `listWaveMembers` is called with `waveUuid` and `uuid`
- **THEN** the function SHALL execute the query and return an array of WaveMember objects with `uuid`, `nickName`, `role`, and `createdAt`

### Requirement: List wave invites query
The frontend SHALL provide a `listWaveInvites` function that calls the GraphQL `listWaveInvites` query.

#### Scenario: List wave invites
- **WHEN** `listWaveInvites` is called with `waveUuid` and `uuid`
- **THEN** the function SHALL execute the query and return an array of WaveInvite objects

### Requirement: List wave abuse reports query
The frontend SHALL provide a `listWaveAbuseReports` function that calls the GraphQL `listWaveAbuseReports` query.

#### Scenario: List wave abuse reports
- **WHEN** `listWaveAbuseReports` is called with `waveUuid` and `uuid`
- **THEN** the function SHALL execute the query and return an array of AbuseReport objects

### Requirement: List wave bans query
The frontend SHALL provide a `listWaveBans` function that calls the GraphQL `listWaveBans` query.

#### Scenario: List wave bans
- **WHEN** `listWaveBans` is called with `waveUuid` and `uuid`
- **THEN** the function SHALL execute the query and return an array of WaveBan objects with `uuid`, `bannedBy`, `reason`, and `createdAt`

### Requirement: Update removePhotoFromWave to include uuid
The frontend `removePhotoFromWave` function SHALL pass the `uuid` parameter to the GraphQL mutation, matching the updated backend schema.

#### Scenario: Remove photo with uuid
- **WHEN** `removePhotoFromWave` is called with `waveUuid`, `photoId`, and `uuid`
- **THEN** the GraphQL mutation SHALL include `uuid` as a required variable

### Requirement: Update createWave to include geo params
The frontend `createWave` function SHALL accept optional `lat`, `lon`, and `radius` parameters and pass them to the GraphQL mutation.

#### Scenario: Create wave with geo boundaries
- **WHEN** `createWave` is called with `name`, `description`, `uuid`, `lat`, `lon`, and `radius`
- **THEN** the GraphQL mutation SHALL include all geo parameters

### Requirement: Update updateWave to include all settings
The frontend `updateWave` function SHALL accept optional `open`, `frozen`, `startDate`, `endDate`, `lat`, `lon`, and `radius` parameters and pass them to the GraphQL mutation.

#### Scenario: Update wave with all settings
- **WHEN** `updateWave` is called with any combination of settings parameters
- **THEN** the GraphQL mutation SHALL include all provided parameters
- **THEN** the mutation response SHALL include all Wave fields including `open`, `frozen`, `startDate`, `endDate`, `isFrozen`, `isActive`, `myRole`, `joinUrl`, `location`, `radius`

### Requirement: Update listWaves query to include new fields
The frontend `listWaves` query SHALL request all new Wave fields from the backend.

#### Scenario: List waves returns extended fields
- **WHEN** `listWaves` is called
- **THEN** the query SHALL request `open`, `frozen`, `startDate`, `endDate`, `isFrozen`, `isActive`, `myRole`, `joinUrl`, `location`, `radius` in addition to existing fields
