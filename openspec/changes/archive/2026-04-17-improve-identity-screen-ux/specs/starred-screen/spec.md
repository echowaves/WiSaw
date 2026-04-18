## ADDED Requirements

### Requirement: Starred screen reloads on identity change
The Starred screen SHALL subscribe to `identityChangeBus` via `subscribeToIdentityChange` and SHALL invoke `reload()` whenever an identity-change event fires, achieving parity with `PhotosList`, `FriendsList`, and `WavesHub`. The subscription SHALL be set up in a `useEffect` that returns the unsubscribe function so the listener is cleaned up on unmount.

#### Scenario: Identity attach refreshes the starred feed
- **WHEN** the Starred screen is mounted and the user attaches an identity (or re-attaches an existing one) on the identity screen
- **THEN** the Starred screen SHALL reload its feed automatically, without requiring an app restart or manual pull-to-refresh

#### Scenario: Identity detach refreshes the starred feed
- **WHEN** the Starred screen is mounted and the user detaches the identity on the identity screen
- **THEN** the Starred screen SHALL reload its feed automatically

#### Scenario: Listener is cleaned up on unmount
- **WHEN** the Starred screen unmounts
- **THEN** the `identityChangeBus` listener SHALL be removed via the unsubscribe function returned from `subscribeToIdentityChange`
