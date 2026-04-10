
### Requirement: Wave join deep link routing
The deep link resolver SHALL recognize `/wave/join/{waveUuid}` URLs and resolve them to `{ type: 'wave-join', waveUuid }`.

#### Scenario: Open wave deep link parsed
- **WHEN** the app receives a URL matching `https://link.wisaw.com/wave/join/{waveUuid}`
- **THEN** `parseDeepLink` SHALL return `{ type: 'wave-join', waveUuid: '{waveUuid}' }`

#### Scenario: Open wave deep link via custom scheme
- **WHEN** the app receives a URL matching `wisaw://wave/join/{waveUuid}`
- **THEN** `parseDeepLink` SHALL return `{ type: 'wave-join', waveUuid: '{waveUuid}' }`

### Requirement: Wave invite deep link routing
The deep link resolver SHALL recognize `/wave/invite/{inviteToken}` URLs and resolve them to `{ type: 'wave-invite', inviteToken }`.

#### Scenario: Invite deep link parsed
- **WHEN** the app receives a URL matching `https://link.wisaw.com/wave/invite/{inviteToken}`
- **THEN** `parseDeepLink` SHALL return `{ type: 'wave-invite', inviteToken: '{inviteToken}' }`

#### Scenario: Invite deep link via custom scheme
- **WHEN** the app receives a URL matching `wisaw://wave/invite/{inviteToken}`
- **THEN** `parseDeepLink` SHALL return `{ type: 'wave-invite', inviteToken: '{inviteToken}' }`

### Requirement: Wave deep link navigation
The `handleDeepLink` function SHALL navigate to the wave join confirmation screen when a wave deep link is resolved.

#### Scenario: Wave join link navigates to confirmation
- **WHEN** `handleDeepLink` processes a `type: 'wave-join'` link
- **THEN** the app SHALL navigate to the wave join screen with `waveUuid` as a search param

#### Scenario: Wave invite link navigates to confirmation
- **WHEN** `handleDeepLink` processes a `type: 'wave-invite'` link
- **THEN** the app SHALL navigate to the wave join screen with `inviteToken` as a search param

### Requirement: Wave join confirmation screen
The app SHALL provide a join confirmation screen at `app/(drawer)/waves/join.tsx` that displays wave information and the photo-visibility contract before allowing the user to join.

#### Scenario: User arrives via open wave link
- **WHEN** the join screen receives a `waveUuid` param
- **THEN** the screen SHALL display the wave name and the photo-visibility disclosure
- **THEN** the screen SHALL show a "Join as Contributor" button and a "Cancel" button

#### Scenario: User arrives via invite token
- **WHEN** the join screen receives an `inviteToken` param
- **THEN** the screen SHALL validate the invite token and display the wave name
- **THEN** the screen SHALL show a "Join as Contributor" button and a "Cancel" button

#### Scenario: User confirms joining open wave
- **WHEN** the user taps "Join as Contributor" for an open wave
- **THEN** the app SHALL call the `joinOpenWave` mutation with `waveUuid` and the device `uuid`
- **THEN** on success, the app SHALL navigate to the wave detail screen

#### Scenario: User confirms joining via invite
- **WHEN** the user taps "Join as Contributor" for an invite-only wave
- **THEN** the app SHALL call the `joinWaveByInvite` mutation with `inviteToken` and the device `uuid`
- **THEN** on success, the app SHALL navigate to the wave detail screen

#### Scenario: Invite is expired
- **WHEN** the join screen validates an invite token and the backend returns "This invite has expired"
- **THEN** the screen SHALL display an error message and disable the join button

#### Scenario: Invite has reached max uses
- **WHEN** the join screen validates an invite token and the backend returns "This invite has reached its maximum number of uses"
- **THEN** the screen SHALL display an error message and disable the join button

#### Scenario: User is banned from wave
- **WHEN** the user attempts to join a wave they are banned from
- **THEN** the screen SHALL display an error message indicating they cannot join

#### Scenario: User is already a member
- **WHEN** the user attempts to join a wave they are already a member of
- **THEN** the app SHALL skip the join mutation and navigate directly to the wave detail screen

### Requirement: Photo-visibility disclosure
The join confirmation screen SHALL display a clear disclosure explaining the wave photo-visibility contract.

#### Scenario: Disclosure text displayed
- **WHEN** the join confirmation screen renders
- **THEN** the screen SHALL display text explaining: (1) all wave photos are visible in the global feed regardless of wave type or status, (2) anyone can delete a photo from the global feed which removes it from the wave, (3) once a wave is frozen, photos cannot be removed or deleted globally

### Requirement: Non-member wave access gating
The app SHALL NOT display wave photos to a user who has not joined the wave when they arrive via deep link.

#### Scenario: Non-member follows wave link
- **WHEN** a non-member user follows a wave deep link
- **THEN** the app SHALL show the join confirmation screen, NOT the wave detail with photos
