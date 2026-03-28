## ADDED Requirements

### Requirement: UploadContext reads global network atom
The UploadContext SHALL read `STATE.netAvailable` via `useAtom` instead of creating its own `NetInfo.addEventListener` subscription. It SHALL remove its local `netAvailable` state and `NetInfo` listener effect.

#### Scenario: UploadContext uses atom for network state
- **WHEN** the UploadContext provider renders
- **THEN** it SHALL read `STATE.netAvailable` via `useAtom`
- **THEN** it SHALL NOT import `NetInfo` or subscribe to `NetInfo.addEventListener`
- **THEN** upload queue processing SHALL still be gated on `netAvailable` as before
