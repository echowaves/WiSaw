## ADDED Requirements

### Requirement: Waves list reloads on identity change
The WavesHub screen SHALL subscribe to identity-change events and reload the waves list when the user's identity is established, updated, or reset.

#### Scenario: Identity registered while waves list is mounted
- **WHEN** the user registers an identity and `emitIdentityChange()` fires
- **THEN** WavesHub SHALL call its reload/refresh function to refetch the waves list with the current uuid

#### Scenario: Subscription cleanup on unmount
- **WHEN** the WavesHub component unmounts
- **THEN** the identity-change listener SHALL be unsubscribed to prevent memory leaks
