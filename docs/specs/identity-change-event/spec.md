## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for identity change event in WiSaw.

## Requirements

### Requirement: Identity change event bus
The system SHALL provide an event bus module (`src/events/identityChangeBus.js`) that allows any screen to subscribe to identity-change notifications. The module SHALL export `subscribeToIdentityChange(listener)` and `emitIdentityChange()` functions following the same `Set`-based listener pattern used by `friendAddBus.js`.

#### Scenario: Screen subscribes to identity changes
- **WHEN** a screen calls `subscribeToIdentityChange(listener)`
- **THEN** the listener function SHALL be added to the internal listener set
- **THEN** the function SHALL return an unsubscribe function that removes the listener from the set

#### Scenario: Identity change is emitted after registration
- **WHEN** `handleSubmit` in SecretScreen completes a successful `registerSecret` call
- **THEN** `emitIdentityChange()` SHALL be called after `setNickName()` and `resetFields()`
- **THEN** all registered listeners SHALL be invoked

#### Scenario: Identity change is emitted after update
- **WHEN** `handleSubmit` in SecretScreen completes a successful `updateSecret` call
- **THEN** `emitIdentityChange()` SHALL be called after `setNickName()` and `resetFields()`

#### Scenario: Identity change is emitted after reset
- **WHEN** `handleReset` in SecretScreen completes a successful identity reset
- **THEN** `emitIdentityChange()` SHALL be called

#### Scenario: Listener errors are isolated
- **WHEN** a listener throws an error during `emitIdentityChange()`
- **THEN** the error SHALL be caught and logged
- **THEN** remaining listeners SHALL still be invoked

#### Scenario: Unsubscribe prevents future notifications
- **WHEN** a screen unmounts and calls the unsubscribe function returned by `subscribeToIdentityChange`
- **THEN** the listener SHALL be removed from the set
- **THEN** subsequent `emitIdentityChange()` calls SHALL NOT invoke the removed listener
