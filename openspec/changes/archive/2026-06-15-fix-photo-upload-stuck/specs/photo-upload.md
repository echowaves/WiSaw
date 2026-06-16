## ADDED Requirements

### Requirement: Automatic Upload Trigger on Network Availability

The system SHALL automatically start uploading queued photos when network connectivity becomes available, without requiring manual user intervention (e.g., pull-to-refresh or app restart).

#### Scenario: Network becomes available after being unavailable

- **WHEN** photos are queued for upload while network is unavailable
- **AND** network connectivity becomes available
- **THEN** uploads start automatically within 750ms (retry delay)
- **AND** no user action is required to trigger uploads

#### Scenario: NetInfo atom stays in sync with actual network state

- **WHEN** network connectivity changes (connected/disconnected)
- **THEN** the `netAvailable` Jotai atom updates within milliseconds
- **THEN** components depending on `netAvailable` receive the updated value
- **AND** upload triggers (useEffect hooks, enqueueCapture logic) use accurate network state

## MODIFIED Requirements

## REMOVED Requirements

## RENAMED Requirements
