## ADDED Requirements

### Requirement: Photo feed reloads on identity change
The PhotosList screen SHALL subscribe to identity-change events and reload the active segment when the user's identity is established, updated, or reset.

#### Scenario: Identity registered while on watchers tab
- **WHEN** the user registers an identity and `emitIdentityChange()` fires
- **THEN** PhotosList SHALL call `reload()` to refetch the current segment's data
- **THEN** the watchers tab SHALL display the user's watched photos from the server

#### Scenario: Identity changed while PhotosList is unmounted
- **WHEN** `emitIdentityChange()` fires but the PhotosList component is not mounted
- **THEN** no reload SHALL occur (the subscription is cleaned up on unmount)

#### Scenario: Subscription cleanup on unmount
- **WHEN** the PhotosList component unmounts
- **THEN** the identity-change listener SHALL be unsubscribed to prevent memory leaks
