## MODIFIED Requirements

### Requirement: Pending friend items show status and remind action
Each pending friend within the card SHALL display the friend's name, a "Waiting for confirmation" status line, an explanation text ("Share this link with your friend to establish the connection. Friend names never leave your device."), and a "Share" button. The Share button SHALL re-share the friendship invitation link via `ShareOptionsModal`.

#### Scenario: Share button re-shares invitation
- **WHEN** the user taps "Share" on a pending friend
- **THEN** the `ShareOptionsModal` SHALL open with that friendship's UUID
- **THEN** the user can share the invitation link via the native share sheet or QR code

#### Scenario: Pending friend displays privacy-aware explanation
- **WHEN** a pending friend item renders
- **THEN** it SHALL display "Waiting for confirmation" as the status line
- **THEN** it SHALL display "Share this link with your friend to establish the connection. Friend names never leave your device." as the explainer text
